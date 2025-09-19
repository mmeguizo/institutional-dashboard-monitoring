import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth.service';
import { UserService } from 'src/app/demo/service/user.service';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
    ValidatorFn,
} from '@angular/forms';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { CampusService } from 'src/app/demo/service/campus.service';

export interface UsersElement {
    _id: string;
    id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    loading: boolean;
}

@Component({
    selector: 'ngx-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
    data: any;
    users: any[] = [];
    statuses: any[] = [];
    deptDropdownValue: any[] = [];
    deptDropdownCampusValue: any[] = [];
    cols!: any;
    loading = true;
    changeStatusCard: boolean = false;
    updateUserCard: boolean = false;
    addUserDialogCard: boolean = false;
    changeStatusId: string;
    updateUserId: string;
    public form: any;
    public Addform: any;
    private getUserSubscription = new Subject<void>();

    roles = [
        { name: 'admin', code: 'admin' },
        { name: 'user', code: 'user' },
    ];

    selectedDept: any;
    selectedRole: any;

    @ViewChild('filter') filter!: ElementRef;
    AllDepartments: any;
    deleteUserCard: boolean;
    deleteUserId: string;
    citiesDemo: { name: string; code: string }[];
    formGroupDemo: any;
    formGroupCampus: any;

    // add chidren
    parentAddNewUser: any;
    parentUpdateUser: {
        updateUser: string;
        updateUserCard: boolean;
        data: any;
    };
    constructor(
        private user: UserService,
        public auth: AuthService,
        public dept: DepartmentService,
        public camp: CampusService,
        private messageService: MessageService,
        public formBuilder: FormBuilder,
        public AddUserFormBuilder: FormBuilder
    ) {}

    ngOnInit() {
        this.getAllusers();
        this.getAllDepartments();
        this.getAllCampuses();
        this.getAllDepartmentDropdown();
        this.cols = [
            { field: 'username', header: 'Username' },
            { field: 'email', header: 'Email' },
            { field: 'department', header: 'Department' },
            { field: 'status', header: 'Status' },
            { field: 'role', header: 'Role' },
        ];

        this.statuses = [
            { label: 'Inactive', value: 'unqualified' },
            { label: 'Active', value: 'qualified' },
            { label: 'Pending', value: 'proposal' },
        ];

        this.createForm();
        // this.createFormAddUser();

        this.formGroupDemo = new FormGroup({
            selectDepartment: new FormControl(),
        });
        this.formGroupCampus = new FormGroup({
            selectedCampus: new FormControl(),
        });
    }

    createForm() {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required]],
            email: ['', [Validators.required]],
            department: ['', [Validators.required]],
        });
    }

    getAllCampuses() {
        this.camp
            .fetch('get', 'campus', 'getAllCampus')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.deptDropdownCampusValue = data.data[0];
            });
    }
    getAllDepartmentDropdown() {
        this.camp
            .fetch('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.deptDropdownValue = data.data[0];
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
                this.loading = false;
            });
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.getUserSubscription.unsubscribe();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    updateUserExecution(form) {



        let data = {
            id: this.updateUserId,
            username: form.value.username,
            email: form.value.email,
            department: this.formGroupDemo.value.selectDepartment.name,
            campus: this.formGroupCampus.value.selectedCampus.name,
            // role: form.value.role.name,
        };

        this.user
            .fetch('put', 'users', 'updateUser', data)
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getAllusers();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.updateUserCard = false;
                } else {
                    this.messageService.add({
                        severity: 'danger  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    deleteUser(id: string) {
        this.deleteUserCard = true;
        this.deleteUserId = id;
    }
    deleteUserExec() {
        this.user
            .fetch('put', 'users', 'setInactiveUser', {
                id: this.deleteUserId,
            })
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getAllusers();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.deleteUserCard = false;
                } else {
                    this.messageService.add({
                        severity: 'danger  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    changeUserStatus(id: any) {
        this.changeStatusCard = true;
        this.changeStatusId = id;
    }
    changeUserStatuExecution(id?: any) {
        this.changeStatusCard = false;
        this.user
            .fetch('put', 'users', 'changeUserStatus', {
                id: this.changeStatusId,
            })
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getAllusers();
                    this.changeStatusCard = false;
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                } else {
                    this.messageService.add({
                        severity: 'danger  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                    this.changeStatusCard = false;
                }
            });
    }

    getAllDepartments() {
        this.dept
            .getRoute('get', 'department', 'getAllDepartment')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.AllDepartments = data.department;
            });
    }

    getErrorMessage(formControlName: string) {
        if (this.Addform.get(formControlName)?.hasError('required')) {
            return 'You must enter a value.';
        } else if (this.Addform.get(formControlName)?.hasError('email')) {
            return 'Please enter a valid email address.';
        } else if (this.Addform.get(formControlName)?.hasError('pattern')) {
            return 'Only Chmsu addresses (chmsu.edu.ph) are accepted.';
        }
        return '';
    }

    updateUser(data : any) {

        console.log({ updateUser :data });

        this.parentUpdateUser = {
            updateUser: 'updateUser',
            updateUserCard: true,
            data: data,
        };
    }

    receivedEditUserEvent(event: any) {
        if (event.addEditedUser) {
            this.getAllusers();
        }
    }

    // add user child component
    addUserDialogButton() {
        this.parentAddNewUser = {
            addNewUser: 'addNewUser',
            addUserDialogCard: true,
        };
        // this.addUserDialogCard = true;
    }

    receivedAddUserEvent(event: any) {
        if (event.addNewUser) {
            this.getAllusers();
        }
    }
}
