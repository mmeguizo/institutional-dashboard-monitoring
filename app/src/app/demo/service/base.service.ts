import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth.service';
import { ConnectionService } from './connection.service';

@Injectable({
    providedIn: 'root',
})
export class BaseService {
    protected options: any;
    protected authToken;

    constructor(
        protected http: HttpClient,
        protected messageService: MessageService,
        protected auth: AuthService,
        protected cs: ConnectionService
    ) {}

    protected createAuthenticationHeaders() {
        this.loadToken();
        this.options = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: '*/*',
            authorization: this.authToken,
        });
    }

    protected loadToken() {
        const token = localStorage.getItem('token');
        this.authToken = token;
    }

    protected getRoute(
        endpoint: any,
        model?: any,
        apiName?: any,
        data?: any
    ): Observable<any> {
        this.createAuthenticationHeaders();
        let url = `${this.cs.domain}/${model}/${apiName}`;
        if (endpoint === 'get' && data) {
            url = `${this.cs.domain}/${model}/${apiName}/${data}`;
        }
        const requestOptions = {
            body: endpoint === 'get' ? null : data,
            headers: this.options,
            observe: 'response' as const,
        };

        return this.http.request(endpoint, url, requestOptions).pipe(
            map((response) => {
                const contentType = response.headers.get('content-type');
                if (contentType && !contentType.includes('application/json')) {
                    console.trace('Received non-JSON response:', contentType);
                }
                return response.body;
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 200) {
                    console.trace('Received non-JSON response with 200 status');
                    return of(error.error);
                }

                // Handle other error cases as before
                if (error.status === 401 || error.status === 403) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'You are unauthorized!',
                    });
                    this.auth.logout();
                } else if (error.status === 500) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Internal server error Or Token Expired. Please try again later.',
                    });
                    this.auth.logout();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error?.message || 'An error occurred',
                    });
                }
                return throwError(() => error);
            })
        );
    }

    getRoutePublic(
        endpoint: any,
        model?: any,
        apiName?: any,
        data?: any
    ): Observable<any> {
        this.createAuthenticationHeaders();
        let url = `${this.cs.domain}/${model}/${apiName}`;
        if (endpoint === 'get' && data) {
            url = `${this.cs.domain}/${model}/${apiName}/${data}`;
        }
        const requestOptions = {
            body: endpoint === 'get' ? null : data,
            headers: this.options,
        };

        return this.http.request(endpoint, url, requestOptions).pipe(
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
                        detail: error.error.message,
                    });
                }
                return throwError(() => error);
            })
        );
    }
}
