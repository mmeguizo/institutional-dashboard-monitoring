import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ChangeDetectorRef,
    SimpleChanges,
    Output,
    EventEmitter,
} from '@angular/core';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { Subject, pipe, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/demo/service/auth.service';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { CampusService } from 'src/app/demo/service/campus.service';
import { ROLE_OPTIONS } from '../contants';
import { UserService } from 'src/app/demo/service/user.service';
import { di } from '@fullcalendar/core/internal-common';

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrl: './add-user.component.scss',
})
export class AddUserComponent implements OnInit, OnDestroy {
    @Input() addNewUser: string;
    @Output() childAddUserEvent = new EventEmitter<object>();

    // dropdown values
    deptDropdownCampusValue: any[] = [];
    dropdownVPValue: any[] = [];
    deptDropdownValue: any[] = [];
    selectVPDropdown: any[] = [];
    selectDirectorDropdown: any[] = [];
    addUserDialogCard: boolean = false;
    roleOptions = ROLE_OPTIONS;

    addnewUserEventFromParent: any;
    private getUserSubscription = new Subject<void>();
    // public  FormGroup;
    Addform: FormGroup;
    formGroupCampus: FormGroup;
    formGroupDemo: FormGroup;
    formGroupVP: FormGroup;

    isVicePresident: boolean = false;
    isDirector: boolean = false;
    formGroupDirector: FormGroup;
    ngOnInit() {
        this.createFormAddUser();
        this.formGroupVP = new FormGroup({
            selectVP: new FormControl(),
        });
        this.formGroupDirector = new FormGroup({
            selectDirector: new FormControl(),
        });
        this.formGroupDemo = new FormGroup({
            selectDepartment: new FormControl(),
        });
        this.formGroupCampus = new FormGroup({
            selectedCampus: new FormControl(),
        });

        this.Addform.get('role').valueChanges.subscribe((role) => {
            this.getAllVicePresident();
            this.getAllDirectors();

            if (role && role.code) {
                if (role.code === 'vice-president') {
                    this.isVicePresident = true;
                }
                if (role.code === 'director') {
                    this.isDirector = true;
                    this.isVicePresident = false;
                }

                if (role.code === 'office-head') {
                    this.isDirector = false;
                    this.isVicePresident = false;
                }
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.addnewUserEventFromParent = changes['addNewUser']?.currentValue;
        if (
            this.addnewUserEventFromParent &&
            this.addnewUserEventFromParent.addNewUser
        ) {
            this.addUserDialogCard =
                this.addnewUserEventFromParent.addUserDialogCard;
            this.getAllCampuses();
            this.getAllDepartmentDropdown();
            this.getAllVicePresident();
            this.getAllDirectors();
        }
    }

    constructor(
        public AddUserFormBuilder: FormBuilder,
        public auth: AuthService,
        public dept: DepartmentService,
        public camp: CampusService,
        public user: UserService,
        private messageService: MessageService,
        public formBuilder: FormBuilder
    ) {}

    createFormAddUser() {
        this.Addform = this.AddUserFormBuilder.group({
            firstname: ['', [Validators.required]],
            lastname: ['', [Validators.required]],
            username: ['', [Validators.required]],
            email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                    Validators.pattern('^.+@chmsu.edu.ph$'),
                ],
            ],
            // department: new FormControl(),
            password: ['', [Validators.required]],
            confirm: ['', [Validators.required]],
            role: ['', [Validators.required]],
            // vice_president: new FormControl(''),
            // director: new FormControl(''),
            // office_head: ['', [Validators.required]],
        });
    }

    getAllVicePresident() {
        this.user
            .fetch('get', 'users', 'getAllVicePresident')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.selectVPDropdown = data.data[0] || [];
            });
    }
    getAllDirectors() {
        this.user
            .fetch('get', 'users', 'getAllDirector')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.selectDirectorDropdown = data.data[0] || [];
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

    async addUserFunction(form: FormGroup): Promise<void> {
        let data = {
            firstname: form.value.firstname,
            lastname: form.value.lastname,
            username: form.value.username,
            email: form.value.email,
            password: form.value.password.trim(),
            confirm: form.value.confirm.trim(),
            role: form.value.role?.code || '',
            campus: this.formGroupCampus.value?.selectedCampus?.name || '',
        };

        // Add optional fields only if they exist
        if (this.formGroupDemo.value?.selectDepartment?.code) {
            data['department'] = this.formGroupDemo.value.selectDepartment.code;
        }

        if (this.formGroupDemo.value?.selectDepartment?.id) {
            data['department_id'] = this.formGroupDemo.value.selectDepartment.id;
        }

        if (this.formGroupVP?.value?.selectVP?.id) {
            data['vice_president_id'] = this.formGroupVP.value.selectVP.id;
        }

        if (this.formGroupVP?.value?.selectVP?.fullname) {
            data['vice_president_name'] = this.formGroupVP.value.selectVP.fullname;
        }

        if (this.formGroupDirector?.value?.selectDirector?.id) {
            data['director_id'] = this.formGroupDirector.value.selectDirector.id;
        }

        if (this.formGroupDirector?.value?.selectDirector?.fullname) {
            data['director_name'] = this.formGroupDirector.value.selectDirector.fullname;
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

        console.log({ addUserFunction: data });
        this.user
            .fetch('post', 'users', 'addUser', data)
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    // this.getAllusers();
                    this.childAddUserEvent.emit({
                        data: data.data,
                        addNewUser: true,
                    });
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.addUserDialogCard = false;
                    this.isDirector = false;
                    this.isVicePresident = false;
                    this.formGroupVP.reset();
                    this.formGroupDirector.reset();
                    this.formGroupDemo.reset();
                    this.formGroupCampus.reset();
                    this.Addform.reset();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: data.err || data.message || 'Failed to add user',
                    });
                }
            });
    }

    resetForm() {
        this.Addform.reset();
        this.formGroupCampus.reset();
        this.formGroupDemo.reset();
        this.formGroupDirector.reset();
        this.formGroupVP.reset();
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

    ngOnDestroy(): void {
        this.getUserSubscription.next();
        this.getUserSubscription.complete();
    }
}
