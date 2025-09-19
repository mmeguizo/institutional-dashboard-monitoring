import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth.service';
import { BaseService } from './base.service';
import { ConnectionService } from './connection.service';
@Injectable({
    providedIn: 'root',
})
export class CampusService extends BaseService {
    constructor(
        http: HttpClient,
        messageService: MessageService,
        auth: AuthService,
        cs: ConnectionService
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
}
