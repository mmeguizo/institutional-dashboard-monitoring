import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../demo/service/auth.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FileService } from '../demo/service/file.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserService } from '../demo/service/user.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductService } from 'src/app/demo/service/product.service';
import { Product } from 'src/app/demo/api/product';
import { ChangeDetectorRef } from '@angular/core';
import { Table } from 'primeng/table';
import { NotificationService } from '../demo/service/notification.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styles: `
   ::ng-deep .p-button.p-button-icon-only {
    width: 2rem !important;
}


.display-photo {
  height: 150px;
  width: 150px;
  border: 2px solid #eee;
  border-radius: 50%;
  background-color: #ccc;
  background-size: cover;
  background-position: center;
  margin: auto;
position: relative;
}

.display-photo:hover::after {
    content: "+";
    color: white;
    background-color: green;
    position: absolute;
    top: 0;
    left: 0;
    font-size: 3em;
    border-radius: 50%;
    opacity: 0.7;
    width: 100%;
    height: 100%;
    transition: opacity 0.2s ease-in-out;
    display: flex;
    justify-content: center;
    align-items: center;
}

.display-photo:hover {
  opacity: 0.8; /* Slightly dim image on hover */
  transition: opacity 0.2s ease-in-out; /* Smooth transition */
}

.rounded-full{
    border-radius: 9999px;
    height: 45px;
}

.d-none {
  display: none !important;
}


.footer-button {
   justify-content: center;
}

 ::ng-deep .p-menuitem-link {
    padding: 10% !important;
}
::ng-deep .p-menubar .p-submenu-list {
 width: 8.5rem;
}

.p-element{
    margin-top: 3px;
}
.rounded-full {
    height: 38px;
}

::ng-deep .p-menubar {
    padding: 0rem !important;
}

@keyframes wiggle {
         0% { transform: rotate(0deg); }
         15% { transform: rotate(-15deg); }
         30% { transform: rotate(10deg); }
         45% { transform: rotate(-10deg); }
         60% { transform: rotate(6deg); }
         75% { transform: rotate(-4deg); }
         100% { transform: rotate(0deg); }
       }

       .animate-bell {
         animation: wiggle 1s ease-in-out infinite;
         transform-origin: top center;
       }

       .animate-bell.clicked {
    animation: none; /* Stop the animation */
}
       /* 🔍 On hover: stop animation and slightly scale */
 .animate-bell:hover {
   animation: none;
   transform: scale(1.2); /* make it slightly bigger */
 }

    `,
})
export class AppTopBarComponent implements OnInit {
    users: any[] = [];
    notificationCount: number = 0;
    notifications: any[] = [];
    private getSubscription = new Subject<void>();
    userData: any;
    public form: any;
    id: string;
    elEventListenerActive: boolean;
    items!: MenuItem[];
    Listitems!: MenuItem[];
    dangerousUrl: any;
    password!: string;
    email!: string;
    username!: string;
    confirmPassword!: string;
    public profile_pic: string;

    bellClicked = false;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    visible: boolean = false;
    logout: boolean = false;

    ref: DynamicDialogRef | undefined;
    name: string;

    passwordNotMatch: boolean = true;

    products: any;
    // products: Product[] = [];
    selectedProduct: Product = {};
    loading = true;
    private getUserSubscription = new Subject<void>();

    notificationDialogVisible: boolean = false;
    selectedNotification: any;
    role: any;

    constructor(
        private productService: ProductService,
        public layoutService: LayoutService,
        public auth: AuthService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        public dialogService: DialogService,
        private sanitizer: DomSanitizer,
        public file: FileService,
        public user: UserService,
        public formBuilder: FormBuilder,
        private cdr: ChangeDetectorRef,
        private notif: NotificationService
    ) {
        this.name = this.auth.getTokenUsername() || '';
        this.profile_pic = this.auth.getUserProfilePic() || 'no-photo.png';
        this.notificationCount = 2;
    }

    private pollingInterval: any;
    overlayOpen: boolean = false;
    // listeners refs so we can remove them
    private visibilityHandler = () => { if (document.visibilityState === 'visible') this.getNotificationCount(); };
    private focusHandler = () => this.getNotificationCount();
    private storageHandler = (ev: StorageEvent) => { if (ev.key && ev.key.toLowerCase().includes('token')) this.getNotificationCount(); };

    ngOnInit() {
        this.productService.getProductsSmallTest().then((products) => {
            this.products = products;
            console.log(this.products);
        });

        this.id = this.auth.getTokenUserID() || '';
        this.role = this.auth.getUserRole() || '';
        this.Listitems = [
            {
                // icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Update',
                        icon: 'pi pi-user-edit',
                        command: () => {
                            this.visible = true;
                        },
                    },
                    {
                        label: 'Logout',
                        icon: 'pi pi-fw pi-sign-in',
                        command: () => {
                            this.logout = true;
                        },
                    },
                ],
            },
            // { separator: true },
        ];

        this.getUserData();
        this.dangerousUrl = this.sanitizer.bypassSecurityTrustUrl(
            this.auth.domain + '/images/no-photo.png'
        );
        // this.dangerousUrl = this.sanitizer.bypassSecurityTrustUrl(
        //     this.auth.domain + '/images/' + this.profile_pic || 'no-photo.png'
        // );
        this.createForm();

        this.getAllusers();

        // this.getNotificationsByRole();

        // initial lightweight check
        this.getNotificationCount();

        // event-driven updates: only poll when user is likely to see results
        document.addEventListener('visibilitychange', this.visibilityHandler);
        window.addEventListener('focus', this.focusHandler);
        window.addEventListener('storage', this.storageHandler);
    }

    ngOnDestroy() {
        // remove event listeners when component is destroyed
        document.removeEventListener('visibilitychange', this.visibilityHandler);
        window.removeEventListener('focus', this.focusHandler);
        window.removeEventListener('storage', this.storageHandler);
        this.getSubscription.next();
        this.getSubscription.complete();
        this.getUserSubscription.next();
        this.getUserSubscription.complete();
    }

    // Lightweight: fetch only counts / minimal info to update badge
    getNotificationCount() {
        // avoid fetching while the overlay/details panel is open
        if (this.overlayOpen) return;
        this.notif.fetch('get', 'notification', 'getNotificationsByRole')
            .subscribe((data: any) => {
                const list = data && data.notifications ? data.notifications : [];
                this.notificationCount = list.filter(
                    (notification: any) => !notification.isRead && notification.userId !== this.id
                ).length;
                this.cdr.detectChanges();
            }, (err) => {
                // ignore errors for background count checks
            });
    }

    // onBellClick(event: Event) {
    //     this.bellClicked = true; // Stop the animation
    //     // Set overlay as open
    //     this.overlayOpen = true;
    //     // fetch full notifications when user explicitly opens the bell
    //     this.getNotificationsByRole();

    //     event.stopPropagation(); // Prevent event bubbling
    // }

    // Add method to handle overlay closing
    onOverlayHide() {
        this.overlayOpen = false;
    }

    getNotificationsByRole() {
        console.log('getNotificationsByRole');
        this.loading = true;
        this.notif
            .fetch('get', 'notification', 'getNotificationsByRole')
            .subscribe((data: any) => {
                console.log({ getNotificationsByRole: data });
                this.loading = false;
                this.notifications = data.notifications;
                // Count only unread notifications where the current user is NOT the sender
                this.notificationCount = data.notifications.filter(
                    (notification) =>
                        !notification.isRead && notification.userId !== this.id
                ).length;
                this.cdr.detectChanges();
            });
    }

    getAllusers() {
        this.loading = true;
        this.user
            .fetch(
                'get',
                'users',
                `getAllUsersExceptLoggedIn/${this.auth.getTokenUserID()}`
            )
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                console.log({ getAllusers: data });
                this.users = data.users;
                this.cdr.detectChanges();
                this.loading = false;
            });
    }

    formatCurrency(value: number) {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'PHP',
        });
    }

    createForm() {
        this.form = this.formBuilder.group({
            firstname: ['', [Validators.required, Validators.required]],
            lastname: ['', [Validators.required, Validators.required]],
            username: ['', [Validators.required]],
            email: ['', [Validators.required]],
            old_password: ['', [Validators.required]],
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
        });
    }

    kickout() {
        this.auth.logout();
    }

    getUserData() {
        this.user
            .fetch('get', 'users', 'profile', this.id)
            .pipe(takeUntil(this.getSubscription))
            .subscribe((data: any) => {
                this.form = this.formBuilder.group({
                    firstname: [data.user.firstname, [Validators.required]],
                    lastname: [data.user.lastname, [Validators.required]],
                    username: [data.user.username, [Validators.required]],
                    email: [data.user.email, [Validators.required]],
                    password: ['', [Validators.required]],
                    old_password: ['', [Validators.required]],
                    confirmPassword: ['', [Validators.required]],
                });
            });
    }

    confirm2(event: any) {
        this.confirmationService.confirm({
            key: 'confirm2',
            target: event.target || new EventTarget(),
            message: 'Are you sure that you want to logout?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.auth.logout();
            },
            reject: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thanks',
                    detail: 'Thanks for staying',
                });
            },
        });
    }

    updates(form: any) {
        // this.confirmationService.

        form.value.id = this.id;
        form.value.profile_pic = this.profile_pic;
        let data = form.value;

        if (form.value.confirmPassword !== form.value.password) {
            this.passwordNotMatch = true;

            return this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Passwords do not match',
            });
        }

        if (
            form.value.firstname == null ||
            (!form.value.firstname && !form.value.lastname) ||
            form.value.lastname == null
        ) {
            return this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'First Name and Last Name are required',
            });
        }
        this.user
            .fetch('put', 'users', 'updateProfile', data)
            .pipe(takeUntil(this.getSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Done, Please Login Again',
                        detail: data.message,
                    });
                    this.visible = false;
                    setTimeout(() => {
                        this.auth.logout();
                    }, 2000);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error updating ${this.name}`,
                        detail: data.message,
                    });
                }
            });
    }
    openFile(ev, id) {
        let file,
            el = document.getElementById(id);
        el.click();
        let handler = (fc) => {
            try {
                let fileList: any;
                let fd = new FormData();
                if (fc.target['files'][0]['name'] !== undefined) {
                    fileList = fc.target;
                    let file: File = fileList.files[0];
                    fd.append('avatar', file, file.name);
                    this.file
                        .addAvatar(fd)
                        .pipe(takeUntil(this.getSubscription))
                        .subscribe((data: any) => {
                            this.elEventListenerActive = false;
                            this.profile_pic = data.data.source;
                            el.removeEventListener('change', handler);
                        });
                } else {
                    // this.Product.image = '';
                    ev.target.innerHTML = 'Browse';
                    this.elEventListenerActive = false;
                    el.removeEventListener('change', handler);
                }
            } catch (e) {
                // this.Product.image = '';
                ev.target.innerHTML = 'Browse';
                this.elEventListenerActive = false;
                el.removeEventListener('change', handler);
            }
        };
        if (!this.elEventListenerActive) {
            el.addEventListener('change', handler);
            this.elEventListenerActive = true;
        }
    }

    onNotificationClick(notification: any) {
        this.selectedNotification = notification;
        this.notificationDialogVisible = true;
        console.log(notification);

        if (this.id === notification.reciepient) {
            if (!notification.isRead) {
                this.notif
                    .fetch(
                        'put',
                        'notification',
                        `updateNotification/${notification._id}`
                    )
                    .subscribe(() => {
                        notification.isRead = true;
                        this.notificationCount--;
                        // this.notifications = [
                        //     ...this.notifications.filter(n => !n.isRead),
                        //     ...this.notifications.filter(n => n.isRead)
                        // ];
                        this.getNotificationsByRole();
                        this.cdr.detectChanges();
                    });
            }
        }
    }

    onDialogClose() {
        this.getNotificationsByRole();
        this.notificationDialogVisible = false;
    }
}
