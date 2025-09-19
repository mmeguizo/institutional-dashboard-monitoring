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
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
        private messageService: MessageService
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
}
