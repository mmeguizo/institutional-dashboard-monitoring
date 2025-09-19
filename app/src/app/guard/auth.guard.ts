import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../demo/service/auth.service';
import { MessageService } from 'primeng/api';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        public authService: AuthService,
        public router: Router,
        private message: MessageService
    ) {}

    canActivate() {
        if (this.authService.hasToken()) {
            const exp = this.authService.getUserTokenExp();
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = exp < currentTime;
            if (isExpired) {
                // Handle expired token (e.g., refresh token, redirect to login)
                this.message.add({
                    severity: 'danger  ',
                    summary: 'Oops',
                    detail: 'Token is expired! Logging out...',
                });

                setTimeout(() => {
                    this.authService.logout();
                }, 1000);
                return false;
            }
            return true;
        } else {
            // this.router.navigate(['login']);
            this.authService.logout();
            return false;
        }
    }
}
