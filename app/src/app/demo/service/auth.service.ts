import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
//map is not working if not imported
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ConnectionService } from './connection.service';
import { jwtDecode } from 'jwt-decode';
import { UserToken } from '../api/user-token';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    public domain: string;
    authToken: any;
    user: any;
    public options: any;
    fulluserloggedData: {};
    public socketserver: any = { status: true, message: 'online' };
    private checkTokenExpirationInterval: any;
    constructor(
        private router: Router,
        public connection: ConnectionService,
        public location: Location,
        private http: HttpClient,
        private messageService: MessageService,
        public jwtHelper: JwtHelperService
    ) {
        this.domain = this.connection.domain;
        this.scheduleTokenExpirationCheck();
    }

    scheduleTokenExpirationCheck() {
        // Check for token expiration every minute
        this.checkTokenExpirationInterval = setInterval(() => {
            if (
                this.authToken &&
                this.jwtHelper.isTokenExpired(this.authToken)
            ) {
                this.logoutIfTokenExpired();
                this.showTokenExpiredToast(); // Show the toast message
            }
        }, 60000); // Check every minute
    }

    showTokenExpiredToast() {
        this.messageService.add({
            severity: 'error',
            summary: 'Session Expired',
            detail: 'Your session has expired. Please log in again.',
        });
    }

    logoutIfTokenExpired() {
        clearInterval(this.checkTokenExpirationInterval); // Clear the interval when logging out.
        this.authToken = null;
        this.user = null;
        // this.fulluserloggedData = null;
        localStorage.clear();
        this.router.navigate(['login']);
    }

    handleError(error: HttpErrorResponse) {
        let errorMessage = 'Unknown error!';
        if (error.error instanceof ErrorEvent) {
            // Client-side errors
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side errors
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        window.alert(errorMessage);
        return throwError(errorMessage);
    }

    createAuthenticationHeaders() {
        this.loadToken();
        this.options = new HttpHeaders({
            'Content-Type': 'application/json',
            authorization: this.authToken,
        });
    }

    loadToken() {
        const token = localStorage.getItem('token');
        this.authToken = token;
    }

    loadFullData() {
        let data = [];
        try {
            data.push(JSON.parse(localStorage.getItem('fulluserloggedData')));
        } catch (ex) {
            console.error(ex);
        }
        return data;
    }

    registerUser(user) {
        // return this.http.post('/authentication/register', user)
        return this.http.post(this.domain + '/authentication/register', user);
    }

    checkUsername(username) {
        // return this.http.get('/authentication/checkUsername/' + username);
        return this.http.get(
            this.domain + '/authentication/checkUsername/' + username
        );
    }

    checkEmail(email) {
        // return this.http.get('/authentication/checkEmail/' + email)
        return this.http.get(
            this.domain + '/authentication/checkEmail/' + email
        );
    }

    // Function to login user
    login(user?: any) {
        return this.http.post(this.domain + '/authentication/login', user).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }
    logout() {
        this.authToken = null;
        this.user = null;
        // this.fulluserloggedData = null;
        localStorage.clear();
        this.router.navigate(['login']);
    }

    CurrentlyloggedIn() {
        const token = this.authToken;
        return !this.jwtHelper.isTokenExpired(token);
    }
    public loggingIn(role) {
        setTimeout(() => {
            this.router.navigate([role]); // Navigate to dashboard view
        }, 500);
        // this.router.navigate([this.getTokenData('role')]);
    }

    // Function to store user's data in client local storage
    storeUserData(token: string, user: any) {
        localStorage.setItem('token', token); // Set token in local storage
        localStorage.setItem('user', JSON.stringify(user)); // Set token in local storage
        localStorage.setItem('fulluserloggedData', JSON.stringify(user)); // Set user); // Set token in local storage
        this.authToken = token; // Assign token to be used elsewhere
        // this.fulluserloggedData = user; // Set user to be used elsewhere
    }

    decoded(token: string) {
        return jwtDecode<UserToken>(token);
    }
    getTokenUsername() {
        return (
            jwtDecode<UserToken>(localStorage.getItem('token')).username || ''
        );
    }
    getTokenUserID() {
        return jwtDecode<UserToken>(localStorage.getItem('token')).id || '';
    }
    getUserProfilePic() {
        return (
            jwtDecode<UserToken>(localStorage.getItem('token')).profile_pic ||
            ''
        );
    }

    getUserRole() {
        return jwtDecode<UserToken>(localStorage.getItem('token')).role || '';
    }
    getUserDepartment() {
        return (
            jwtDecode<UserToken>(localStorage.getItem('token')).department || ''
        );
    }
    getUserCampus() {
        return jwtDecode<UserToken>(localStorage.getItem('token')).campus || '';
    }
    getUserTokenExp() {
        return jwtDecode<UserToken>(localStorage.getItem('token')).exp || 0;
    }

    getProfile() {
        //this.options => is not working but with {headers : this.options} is working i read it i guess in angular docs
        //'@auth0/angular-jwt'; is adding 'Bearer ' in token so i removed it manually
        this.createAuthenticationHeaders();
        //return this.http.get('/authentication/profile', { headers: this.options })
        return this.http
            .get(this.domain + '/authentication/profile', {
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
                        this.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.logout();
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

    getPublicProfile(username) {
        this.createAuthenticationHeaders(); // Create headers before sending to API
        // return this.http.get('/authentication/publicProfile/' + username, { headers: this.options });
        return this.http
            .get(this.domain + 'authentication/publicProfile/' + username, {
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
                        this.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.logout();
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

    public back() {
        this.location.back();
    }

    makeToast(status: string, title: string, content: any) {
        this.messageService.add({
            severity: status,
            summary: title,
            detail: content,
        });
    }

    runTestMessage() {
        this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Product Created',
            life: 3000,
        });
    }

    //legacy code

    public getToken() {
        return localStorage.getItem('token');
    }

    /**
     * @return {Boolean} if user has token and equals to role
     * true or false
     */
    public hasToken() {
        return this.getToken()
            ? (() => {
                  this.Observer();
                  return true;
              })()
            : false;
    }

    /**
     * @return {Void}
     * @description observes routes by role
     */
    public Observer(): void {
        let role = this.getUserRole();
        let self = this.router.events.subscribe((nextUrl) => {
            if (nextUrl instanceof NavigationEnd) {
                if (this.location.path().split('/')[1] !== role) {
                    self.unsubscribe();
                    this.router.navigate([role]);
                }
            }
        });
    }

    /**
     * @param {String} key any object property of signed user
     * @return {String} key value
     */

    getCurrentTheme() {
        return localStorage.getItem('theme');
    }
    public getTokenData(key?) {
        try {
            if (this.hasToken) {
                let token = JSON.parse(atob(this.getToken().split('.')[1]));
                if (key) {
                    switch (typeof key) {
                        case 'string':
                            return token[key];
                        case 'object':
                            return key.map((k) => token[k]);
                    }
                } else {
                    return token;
                }
            }
        } catch (e) {
            this.logout();
            //console.info('Error:', e.message);
        }
    }

    getRoute(endpoint: any, model?: any, apiName?: any, data?: any) {
        this.createAuthenticationHeaders();
        const url = `${this.connection.domain}/${model}/${apiName}`;
        return this.http
            .request(endpoint, url, {
                body: data,
                // headers: this.options,
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
                        this.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.logout();
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
