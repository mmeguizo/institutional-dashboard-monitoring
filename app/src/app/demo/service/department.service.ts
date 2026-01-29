import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpErrorResponse,
} from '@angular/common/http';
import { ConnectionService } from './connection.service';
import { AuthService } from './auth.service';
import { MessageService } from 'primeng/api';
import { catchError, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { CacheService } from './cache.service';

/** Pagination parameters interface */
export interface PaginationParams {
    page?: number;
    limit?: number;
}

/** Paginated response interface */
export interface PaginatedResponse<T> {
    success: boolean;
    data?: T[];
    departments?: T[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    message?: string;
}

@Injectable({
    providedIn: 'root',
})
export class DepartmentService {
    public authToken;
    public options;
    picture: HttpHeaders;

    constructor(
        public auth: AuthService,
        public cs: ConnectionService,
        private http: HttpClient,
        private messageService: MessageService,
        private cacheService: CacheService
    ) {}

    createAuthenticationHeaders() {
        this.loadToken();
        this.options = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'image/jpeg',
            authorization: this.authToken,
        });
    }

    loadToken() {
        const token = localStorage.getItem('token');
        this.authToken = token;
    }

    private getEndpoint(model: string, apiName: string) {
        return `${this.cs.domain}/${model}/${apiName}`;
    }

    getRoute(endpoint: any, model?: any, apiName?: any, data?: any) {
        this.createAuthenticationHeaders();
        const url = `${this.cs.domain}/${model}/${apiName}`;
        return this.http
            .request(endpoint, url, {
                body: data,
                headers: this.options,
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    return throwError(() => error);
                })
            );
    }

    /**
     * Get all departments with caching
     * Use this for dropdowns and lists that don't need real-time data
     */
    getAllDepartmentsCached(): Observable<any> {
        this.createAuthenticationHeaders();
        const url = `${this.cs.domain}/department/getAllDepartmentNoPagination`;

        return this.cacheService.getOrFetch(
            'departments:all',
            this.http.get(url, { headers: this.options }).pipe(
                catchError((error: HttpErrorResponse) => {
                    return throwError(() => error);
                })
            )
        );
    }

    /**
     * Get departments with pagination
     * Use this for tables with large datasets
     */
    getDepartmentsPaginated(params: PaginationParams = {}): Observable<PaginatedResponse<any>> {
        this.createAuthenticationHeaders();
        const { page = 1, limit = 20 } = params;
        const url = `${this.cs.domain}/department/getAllDepartment?page=${page}&limit=${limit}`;

        return this.http.get<PaginatedResponse<any>>(url, { headers: this.options }).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    /**
     * Invalidate department cache (call after add/update/delete)
     */
    invalidateCache(): void {
        this.cacheService.invalidateByPrefix('departments');
    }
}

