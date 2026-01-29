import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, Validators } from '@angular/forms';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { UserService } from 'src/app/demo/service/user.service';

@Component({
    selector: 'app-departments',
    templateUrl: './departments.component.html',
    styleUrl: './departments.component.scss',
})
export class DepartmentsComponent implements OnInit, OnDestroy {
    /** Subject for managing subscriptions - MUST call next() and complete() in ngOnDestroy */
    private destroy$ = new Subject<void>();
    @ViewChild('filter') filter!: ElementRef;

    depts: any[] = [];
    allUsers: any[] = [];
    cols!: any;
    loading = true;
    changeStatusCard: boolean = false;
    cardCrudDialog: boolean = false;
    departmentName: string = '';
    department_head: any;
    updatingDept: boolean;
    updateDepartmentId: any;

    constructor(
        private messageService: MessageService,
        public formBuilder: FormBuilder,
        public department: DepartmentService,
        private confirmationService: ConfirmationService,
        public user: UserService
    ) {}

    ngOnInit() {
        this.getDepartments();

        this.cols = [
            { field: 'department', header: 'Department' },
            { field: 'status', header: 'Status' },
            { field: 'options', header: 'Options' },
        ];
    }

    ngOnDestroy(): void {
        // Properly complete the subject to unsubscribe all subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }

    async getAllUsers() {
        return new Promise<void>((resolve) => {
            this.user
                .fetch('get', 'users', 'getAllUsersAdminDepartments')
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (data: any) => {
                        this.allUsers = data?.users || [];
                        resolve();
                    },
                    error: (err) => {
                        console.error('Error fetching users:', err);
                        this.allUsers = [];
                        resolve();
                    }
                });
        });
    }

    getDepartments() {
        this.loading = true;
        this.department
            .getRoute('get', 'department', 'getAllDepartment')
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading = false)
            )
            .subscribe({
                next: (data: any) => {
                    this.depts = data.departments || [];
                },
                error: (err) => {
                    console.error('Error fetching departments:', err);
                    this.depts = [];
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load departments',
                    });
                }
            });
    }

    addDept() {
        this.getAllUsers();
        this.cardCrudDialog = true;
        this.updatingDept = false;
    }

    async updateDept(dept: any) {
        await this.getAllUsers();
        console.log({ updateDept: dept });

        this.departmentName = dept.department;
        this.updateDepartmentId = dept.id;
        this.updatingDept = true;
        this.cardCrudDialog = true;

        // this.department_head = this.allUsers.filter(
        //     (user) => user.code === dept.user_id
        // )[0].name;
        // console.log(this.department_head);

        const matchedUser = this.allUsers.find(
            (user) => user.code === dept.user_id
        );
        if (matchedUser) {
            this.department_head = matchedUser;
        }
    }

    updateDepartmentExec() {
        if (this.departmentName == '') {
            return this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please provide Department Name',
            });
        }
        this.loading = true;

        console.log({
            updateDepartmentExec: 'updateDepartmentExec',
            id: this.updateDepartmentId,
            department: this.departmentName,
            department_head: this.department_head?.name,
            user_id: this.department_head?.code,
        });

        this.department
            .getRoute('put', 'department', 'updateDepartment', {
                id: this.updateDepartmentId,
                department: this.departmentName,
                department_head: this.department_head?.name,
                user_id: this.department_head?.code,
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
                this.cardCrudDialog = false;
                this.getDepartments();
                this.loading = false;
                this.messageService.add({
                    severity: 'success  ',
                    summary: 'Done',
                    detail: data.message,
                    life: 5000,
                });
                this.departmentName = '';
                this.updateDepartmentId = '';
                this.updatingDept = false;
            });
    }
    deleteDept(id: string) {
        this.confirmationService.confirm({
            key: 'updateDepartment',
            target: event.target as EventTarget,
            message: `This will remove completely on the database?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'none',
            rejectIcon: 'none',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.department
                    .getRoute('put', 'department', 'deleteDepartment', {
                        id: id,
                    })
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((data: any) => {
                        this.getDepartments();
                        this.messageService.add({
                            severity: 'success  ',
                            summary: 'Done',
                            detail: data.message,
                            life: 5000,
                        });
                    });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Done',
                    detail: 'Got it...',
                    life: 3000,
                });
            },
        });
    }

    changeDeptStatus(event: Event, id: string) {
        this.confirmationService.confirm({
            key: 'updateDepartment',
            target: event.target as EventTarget,
            message: `Change Status?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'none',
            rejectIcon: 'none',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.department
                    .getRoute('put', 'department', 'changeDepartmentStatus', {
                        id: id,
                    })
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((data: any) => {
                        this.getDepartments();
                        this.messageService.add({
                            severity: 'success  ',
                            summary: 'Done',
                            detail: data.message,
                            life: 5000,
                        });
                    });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Done',
                    detail: 'Nothing happens',
                    life: 3000,
                });
            },
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    addDeptDialogExec() {
        if (this.departmentName == '') {
            return this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please provide Department Name',
            });
        }
        if (this.department_head == '') {
            return this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please provide Department head',
            });
        }
        this.loading = true;
        console.log({
            departmentName: this.departmentName.trim(),
            department_head: this.department_head,
        });
        this.department
            .getRoute('post', 'department', 'addDepartment', {
                department: {
                    departmentName: this.departmentName.trim(),
                    department_head: this.department_head,
                },
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
                this.cardCrudDialog = false;
                this.getDepartments();
                this.loading = false;
                this.messageService.add({
                    severity: 'success  ',
                    summary: 'Done',
                    detail: data.message,
                    life: 5000,
                });
                this.departmentName = '';
            });
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
}
