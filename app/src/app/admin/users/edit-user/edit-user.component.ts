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
import { Campus } from 'src/app/interface/campus-location.interface';
import { di } from '@fullcalendar/core/internal-common';
@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit, OnDestroy {
    @Input() updateUser: string;
    @Output() childEditUserEvent = new EventEmitter<object>();
    deptDropdownCampusValue: any[] = [];
    deptDropdownValue: any[] = [];
    dropdownVPValue: any[] = [];
    selectDiretor: any[] = [];
    selectVP: any[] = [];
    updateUserCard: boolean = false;
    public form: FormGroup;
    formGroupDemo: FormGroup;
    formGroupCampus: FormGroup;
    editNewUserEventFromParent: any;
    private getUserSubscription = new Subject<void>();
    selectedDept: string;
    selectedRole: string;
    updateUserId: string;
    roleOptions = ROLE_OPTIONS;
    isVicePresident: boolean = false;
    isDirector: boolean = false;
    formGroupVP: FormGroup;
    constructor(
        public AddUserFormBuilder: FormBuilder,
        public auth: AuthService,
        public dept: DepartmentService,
        public camp: CampusService,
        public user: UserService,
        private messageService: MessageService,
        public formBuilder: FormBuilder
    ) {}
    ngOnInit() {
        this.createForm();
        this.formGroupDemo = new FormGroup({
            selectDepartment: new FormControl(),
        });
        this.formGroupCampus = new FormGroup({
            selectedCampus: new FormControl(),
        });
        this.formGroupVP = new FormGroup({
            selectVP: new FormControl(),
        });

        this.getAllCampuses();
        this.getAllVicePresident();
        this.getAllDepartmentDropdown();
        this.getAllDirectors();
        this.form.get('role').valueChanges.subscribe((role) => {
            this.getAllVicePresident();

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
        // this.getAllCampuses();
        // this.getAllVicePresident();
        // this.getAllDepartmentDropdown();
        const data = changes['updateUser']?.currentValue?.data;

        this.editNewUserEventFromParent = changes['updateUser']?.currentValue;

        console.log({ ngOnChanges: data });

        if (data) {
            // Handle vice president data
            if (!data.vice_president_id || !data.vice_president_name) {
                this.isVicePresident = false;
                this.form.controls['vice_president'].setValue('');
            }
            
            // Handle director data
            if (!data.director_id || !data.director_name) {
                this.isDirector = false;
                this.form.controls['director'].setValue('');
            }

            if (this.editNewUserEventFromParent && this.editNewUserEventFromParent.updateUser) {
                this.updateUserCard =
                    this.editNewUserEventFromParent.updateUserCard;

                this.selectedDept = data.department;
                this.selectedRole = data.role;

                // Replace the existing setValue code with this conditional check
                if (data.department) {
                    const departmentMatch = this.deptDropdownValue.find(
                        (dept) => dept.code === data.department
                    );
                    if (departmentMatch) {
                        this.formGroupDemo.setValue({
                            selectDepartment: departmentMatch
                        });
                    } else {
                        this.formGroupDemo.reset(); // Reset if no match found
                    }
                } else {
                    this.formGroupDemo.reset(); // Reset if no department
                }
                // if (data.role === 'director') {
                //     this.isDirector = true;
                //     this.isVicePresident = true;
                //     selectedVp = this.selectVP.find(
                //         (vp) => vp.id === data.vice_president_id
                //     );
                //     // this.form.controls['vice_president'].setValue('');
                //     this.form.controls['director'].setValue(data.director);
                // } else if (data.role === 'vice-president') {
                //     this.isVicePresident = false;
                //     this.isDirector = false;
                //     this.form.controls['vice_president'].setValue(
                //         data.vice_president
                //     );
                //     this.form.controls['director'].setValue('');
                // } else {
                //     this.isDirector = false;
                //     this.isVicePresident = false;
                //     this.form.controls['vice_president'].setValue('');
                //     this.form.controls['director'].setValue('');
                // }

                const rolesSelected = this.roleOptions.find(
                    (role) => role.code === data.role
                );

                this.formGroupCampus.setValue({
                    selectedCampus: this.deptDropdownCampusValue.find(
                        (dept) => dept.code === data.campus
                    ),
                });

                // Find selected VP and director only if IDs exist
                const selectedDirector = data.director_id ? 
                    this.selectDiretor.find(director => director.id === data.director_id) : 
                    null;

                const selectedVp = data.vice_president_id ? 
                    this.selectVP.find(vp => vp.id === data.vice_president_id) : 
                    null;
                
                this.form.setValue({
                    firstname: data.firstname ? data.firstname : 'tester',
                    lastname: data.lastname ? data.lastname : '',
                    username: data.username ? data.username : '',
                    email: data.email ? data.email : '',
                    department: data.department ? data.department : '',
                    role: rolesSelected || '',
                    vice_president: selectedVp || '',
                    director: selectedDirector || '',
                    office_head: '',
                    campus: data.campus ? data.campus : '',
                    password: '',
                    confirm: '',
                });

                this.updateUserCard = true;
                this.updateUserId = data.id;
            }
        }
    }

    createForm() {
        this.form = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            username: ['', [Validators.required]],
            email: ['', [Validators.required]],
            department: ['', [Validators.required]],
            campus: ['', [Validators.required]],
            role: ['', [Validators.required]],
            password: ['', [Validators.required]],
            confirm: ['', [Validators.required]],
            vice_president: [''],  // Removed Validators.required
            director: [''],  // Removed Validators.required
            office_head: ['', [Validators.required]],
        });
    }

    getAllVicePresident() {
        this.user
            .fetch('get', 'users', 'getAllVicePresident')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.selectVP = data.data[0] || [];
            });
    }

    getAllDirectors() {
        this.user
            .fetch('get', 'users', 'getAllDirector')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.selectDiretor = data.data[0] || [];
                console.log({ getAllDirectors: this.selectDiretor });
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
    ngOnDestroy(): void {
        this.getUserSubscription.next();
        this.getUserSubscription.complete();
    }

    updateUserExecution(form: FormGroup): void {
        let data: any = {
            id: this.updateUserId,
            username: form.value.username,
            email: form.value.email,
            department: this.formGroupDemo.value.selectDepartment?.code || '',
            department_id: this.formGroupDemo.value.selectDepartment?.id || '',
            campus: this.formGroupCampus.value.selectedCampus?.name || '',
            role: form.value.role.code,
            vice_president_id: '',
            vice_president_name: '',
            director_id: '',
            director_name: ''
        };

        if (form.value.vice_president && form.value.vice_president.id) {
            data.vice_president_id = form.value.vice_president.id;
            data.vice_president_name = form.value.vice_president.fullname;
        }

        if (form.value.director && form.value.director.id) {
            data.director_id = form.value.director.id;
            data.director_name = form.value.director.fullname;
        }

        if (form.value.password.trim() || form.value.confirm.trim()) {
            if (form.value.password.trim() !== form.value.confirm.trim()) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Password and confirm password do not match',
                });
                return;
            } else {
                data.password = form.value.password.trim();
                data.confirm = form.value.confirm.trim();
            }
        }
        console.log({ updateUserExecution: data });
        this.user
            .fetch('put', 'users', 'updateUserAdmin', data)
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.childEditUserEvent.emit({
                        data: data.data,
                        addEditedUser: true,
                    });

                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.updateUserCard = false;
                    this.form.reset();
                } else {
                    this.messageService.add({
                        severity: 'danger  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }
}
