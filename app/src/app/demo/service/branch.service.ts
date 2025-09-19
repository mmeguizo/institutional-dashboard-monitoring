import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class BranchService {
    constructor(private http: HttpClient) {}

    getCampus() {
        return this.http
            .get<any>('assets/demo/data/branches.json')
            .toPromise()
            .then((res) => res.data as any[])
            .then((data) => data);
    }
}
