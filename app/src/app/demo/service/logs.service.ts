import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RouteService } from './route.service';
RouteService;
@Injectable()
export class LogService {
    constructor(private http: HttpClient, public route: RouteService) {}

    getAllLogs(endpoint: any, model?: any, apiName?: any, data?: any) {
        return this.route.getRoute(endpoint, model, apiName, data);
    }
}
