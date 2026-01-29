import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth.service';
import { BaseService } from './base.service';
import { ConnectionService } from './connection.service';
import { CacheService } from './cache.service';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CampusService extends BaseService {
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
     * Get all campuses with caching (30 min TTL - campus data rarely changes)
     */
    getAllCampusesCached(): Observable<any> {
        this.createAuthenticationHeaders();
        const url = `${this.cs.domain}/campus/getAllCampus`;

        return this.cacheService.getOrFetch(
            'campuses:all',
            this.http.get(url, { headers: this.options }).pipe(
                catchError((error: HttpErrorResponse) => {
                    return throwError(() => error);
                })
            ),
            30 * 60 * 1000 // 30 minutes TTL for campus data
        );
    }

    /**
     * Invalidate campus cache (call after add/update/delete)
     */
    invalidateCache(): void {
        this.cacheService.invalidateByPrefix('campuses');
    }
}
