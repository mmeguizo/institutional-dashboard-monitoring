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
import { throwError, Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
    providedIn: 'root',
})
export class ObjectiveService extends BaseService {
    // private authToken;
    // private options;

    // constructor(
    //     private auth: AuthService,
    //     private cs: ConnectionService,
    //     private http: HttpClient,
    //     private messageService: MessageService
    // ) {}

    constructor(
        http: HttpClient,
        messageService: MessageService,
        auth: AuthService,
        cs: ConnectionService
    ) {
        super(http, messageService, auth, cs);
    }

    // createAuthenticationHeaders() {
    //     this.loadToken();
    //     this.options = new HttpHeaders({
    //         'Content-Type': 'application/json',
    //         Accept: 'image/jpeg',
    //         authorization: this.authToken,
    //     });
    // }

    // loadToken() {
    //     const token = localStorage.getItem('token');
    //     this.authToken = token;
    // }

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
    //     const url = `${this.cs.domain}/${model}/${apiName}`;
    //     return this.http
    //         .request(endpoint, url, {
    //             body: data,
    //             headers: this.options,
    //         })
    //         .pipe(
    //             catchError((error: HttpErrorResponse) => {
    //                 console.error(`API Error (${error.status}):`, error.error);
    //                 if (error.status === 401 || error.status === 403) {
    //                     this.messageService.add({
    //                         severity: 'error',
    //                         summary: 'Error',
    //                         detail: 'You are unauthorized!',
    //                     });
    //                     this.auth.logout();
    //                 } else if (error.status === 500) {
    //                     // Internal server error Or Token Expired
    //                     this.messageService.add({
    //                         severity: 'error',
    //                         summary: 'Error',
    //                         detail: 'Internal server error Or Token Expired. Please try again later.',
    //                     });

    //                     this.auth.logout();
    //                 } else if (error.status === 404) {
    //                     // Not found error
    //                     this.messageService.add({
    //                         severity: 'error',
    //                         summary: 'Error',
    //                         detail: 'The requested resource was not found.',
    //                     });
    //                 } else {
    //                     // Other errors
    //                     this.messageService.add({
    //                         severity: 'error',
    //                         summary: 'Error',
    //                         detail: error.error,
    //                     });
    //                 }

    //                 return throwError(() => error);
    //             })
    //         );
    // }
}
