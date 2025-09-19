//

import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service'; // Adjust the path if needed

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router, private authService: AuthService) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // Get the token from wherever you're storing it (e.g., local storage)
        const token = this.authService.getToken();
        // If there's a token, add it to the Authorization header
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: token,
                },
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Unauthorized
                    // Check for specific token expiration message from your backend if needed
                    // if (error.error && error.error.message === 'Token expired. Please log in again.') {
                    this.authService.logout(); // Clear token, etc.
                    this.router.navigate(['/login']); // Redirect to login
                    // }
                }
                return throwError(() => error);
            })
        );
    }
}
