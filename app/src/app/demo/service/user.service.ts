import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { ConnectionService } from './connection.service';
import { AuthService } from './auth.service';
import { MessageService } from 'primeng/api';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { Observable, throwError } from 'rxjs';
import { CacheService } from './cache.service';

/** Pagination parameters interface */
export interface UserPaginationParams {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
}

/** Paginated response interface */
export interface PaginatedUserResponse<T> {
    success: boolean;
    data?: T[];
    users?: T[];
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
export class UserService extends BaseService {
    //  public authToken;
    //  public options;
    picture: HttpHeaders;

    constructor(
        protected override http: HttpClient,
        protected override messageService: MessageService,
        protected override auth: AuthService,
        protected override cs: ConnectionService,
        private cacheService: CacheService
    ) {
        super(http, messageService, auth, cs);
    }

    // override createAuthenticationHeaders() {
    //     this.loadToken();
    //     this.options = new HttpHeaders({
    //         'Content-Type': 'application/json',
    //         Accept: 'image/jpeg',
    //         authorization: this.authToken,
    //     });
    // }

    // override loadToken() {
    //     const token = localStorage.getItem('token');
    //     this.authToken = token;
    // }
    protected override createAuthenticationHeaders() {
        super.createAuthenticationHeaders(); // Call the method from BaseService
    }

    protected override loadToken() {
        super.loadToken(); // Call the method from BaseService
    }

    fetch(
        domain: string,
        model: string,
        call: string,
        data?: any
    ): Observable<any> {
        return this.getRoute(domain, model, call, data);
    }

    // getRoute(endpoint: any, model?: any, apiName?: any, data?: any) {
    //     this.createAuthenticationHeaders();
    //     let url = `${this.cs.domain}/${model}/${apiName}`;

    //     if (endpoint === 'get' && apiName === 'profile') {
    //         url = `${this.cs.domain}/${model}/${apiName}/${data}`;
    //     }

    //     const requestConfig = {
    //         body: data,
    //         headers: this.options,
    //     };

    //     return this.http.request(endpoint, url, requestConfig).pipe(
    //         catchError((error: HttpErrorResponse) => {
    //             console.error(`API Error (${error.status}):`, error.error);
    //             if (error.status === 401 || error.status === 403) {
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'You are unauthorized!',
    //                 });
    //                 this.auth.logout();
    //             } else if (error.status === 500) {
    //                 // Internal server error Or Token Expired
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'Internal server error Or Token Expired. Please try again later.',
    //                 });
    //             } else if (error.status === 404) {
    //                 // Not found error
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'The requested resource was not found.',
    //                 });
    //             } else {
    //                 // Other errors
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: error.error,
    //                 });
    //             }

    //             return throwError(() => error);
    //         })
    //     );
    // }
    getAllUsers() {
        this.createAuthenticationHeaders();
        return this.http
            .get(this.cs.domain + '/users/getAllUser', {
                headers: this.options,
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }

    /**
     * Get all users with caching (5 min TTL)
     */
    getAllUsersCached(): Observable<any> {
        this.createAuthenticationHeaders();
        return this.cacheService.getOrFetch(
            'users:all',
            this.http.get(this.cs.domain + '/users/getAllUser', {
                headers: this.options,
            }).pipe(
                catchError((error: HttpErrorResponse) => {
                    return throwError(() => error);
                })
            ),
            5 * 60 * 1000 // 5 minutes TTL
        );
    }

    /**
     * Get users with pagination
     */
    getUsersPaginated(params: UserPaginationParams = {}): Observable<PaginatedUserResponse<any>> {
        this.createAuthenticationHeaders();
        const { page = 1, limit = 20, role, search } = params;
        let url = `${this.cs.domain}/users/getAllUser?page=${page}&limit=${limit}`;
        if (role) url += `&role=${role}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        return this.http.get<PaginatedUserResponse<any>>(url, { headers: this.options }).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    /**
     * Invalidate users cache (call after add/update/delete)
     */
    invalidateCache(): void {
        this.cacheService.invalidateByPrefix('users');
    }

    getUserProfilePic(data) {
        this.createAuthenticationHeaders();
        this.picture = new HttpHeaders({
            // 'Accept': 'image/jpeg',
            'Content-Type': 'application/octet-stream',
            authorization: this.authToken,
        });
        return this.http
            .get(this.cs.domain + '/users/UserProfilePic/' + data, {
                headers: this.picture,
                responseType: 'blob',
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(() => error);
                })
            );
    }
}
