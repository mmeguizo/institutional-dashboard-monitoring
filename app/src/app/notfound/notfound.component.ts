import { Component } from '@angular/core';
import { AuthService } from '../demo/service/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html',
    styleUrl: './notfound.component.scss',
})
export class NotfoundComponent {
    role: string;

    constructor(private authService: AuthService, private router: Router) {
        this.role = this.authService.getUserRole() || '';
    }

    location_back() {
        this.authService.back();
    }

    homepage() {
        this.router.navigate([this.role]);
    }
}
