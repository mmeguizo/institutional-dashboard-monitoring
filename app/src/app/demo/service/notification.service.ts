import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConnectionService } from './connection.service';
import { AuthService } from './auth.service';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
    providedIn: 'root',
})
export class NotificationService extends BaseService {
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
