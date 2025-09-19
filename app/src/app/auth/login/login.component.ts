import { Component, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/demo/service/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [
        `
            :host ::ng-deep .pi-eye,
            :host ::ng-deep .pi-eye-slash {
                transform: scale(1.6);
                margin-right: 1rem;
                color: var(--primary-color) !important;
            }
        `,
    ],
    providers: [MessageService],
})
export class LoginComponent implements OnDestroy {
    valCheck: string[] = ['remember'];
    private getSubscription = new Subject<void>();

    password!: string;
    email!: string;

    constructor(
        public layoutService: LayoutService,
        private auth: AuthService,
        private msg: MessageService
    ) {}

    onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.onLoginSubmit();
        }
    }

    onLoginSubmit() {
        if (!this.email || !this.password) {
            this.msg.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Email or Password cannot be blank',
            });
            return;
        }

        this.auth
            .getRoute('post', 'authentication', 'login', {
                email: this.email,
                password: this.password,
            })
            .pipe(takeUntil(this.getSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    let decoded = this.auth.decoded(data.token);

                    this.auth.storeUserData(data.token, decoded);
                    if (this.auth.CurrentlyloggedIn()) {
                        this.msg.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Login Successful',
                        });
                        this.auth.loggingIn(decoded.role);
                    }
                } else {
                    this.msg.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Login Failed',
                    });
                }
            });
    }

    ngOnDestroy() {
        this.getSubscription.unsubscribe();
    }
}
