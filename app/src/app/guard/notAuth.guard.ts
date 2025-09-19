import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../demo/service/auth.service';
@Injectable()
export class NotAuthGuard implements CanActivate {
    constructor(public authService: AuthService, public router: Router) {}

    canActivate() {
        if (this.authService.hasToken()) {
            // this.router.navigate(['/admin/dashboard']);
            return false;
        } else {
            // this.authService.login();
            this.router.navigate(['login']);
            return true;
        }
    }
}
