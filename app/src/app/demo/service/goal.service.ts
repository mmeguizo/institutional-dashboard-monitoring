import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ConnectionService } from './connection.service';
import { AuthService } from './auth.service';
import { MessageService } from 'primeng/api';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { CacheService } from './cache.service';

/** Pagination parameters interface */
export interface GoalPaginationParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

/** Paginated response interface */
export interface PaginatedGoalResponse<T> {
    success: boolean;
    data?: T[];
    goals?: T[];
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
export class GoalService extends BaseService {
    constructor(
        http: HttpClient,
        messageService: MessageService,
        auth: AuthService,
        cs: ConnectionService,
        private cacheService: CacheService
    ) {
        super(http, messageService, auth, cs);
    }

    fetch(
        domain: string,
        model: string,
        call: string,
        data?: any
    ): Observable<any> {
        return this.getRoute(domain, model, call, data);
    }

    /**
     * Get goals with pagination
     * Use this for tables with large datasets
     */
    getGoalsPaginated(params: GoalPaginationParams = {}): Observable<PaginatedGoalResponse<any>> {
        this.createAuthenticationHeaders();
        const { page = 1, limit = 20, status, search } = params;
        let url = `${this.cs.domain}/goals/getAllGoals?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        return this.http.get<PaginatedGoalResponse<any>>(url, { headers: this.options }).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    /**
     * Get goals by user with caching
     */
    getGoalsByUserCached(userId: string): Observable<any> {
        this.createAuthenticationHeaders();
        const url = `${this.cs.domain}/goals/getGoalsByUser/${userId}`;

        return this.cacheService.getOrFetch(
            `goals:user:${userId}`,
            this.http.get(url, { headers: this.options }).pipe(
                catchError((error: HttpErrorResponse) => {
                    return throwError(() => error);
                })
            ),
            3 * 60 * 1000 // 3 minute TTL for user goals
        );
    }

    /**
     * Invalidate goals cache (call after add/update/delete)
     */
    invalidateCache(userId?: string): void {
        if (userId) {
            this.cacheService.invalidate(`goals:user:${userId}`);
        }
        this.cacheService.invalidateByPrefix('goals');
    }
}
