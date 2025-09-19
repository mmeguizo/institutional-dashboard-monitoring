import {
    Component,
    OnInit,
    OnDestroy,
    Input,
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
import { Subject, takeUntil } from 'rxjs';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { MessageService } from 'primeng/api';
import { CampusService } from 'src/app/demo/service/campus.service';
import { AuthService } from 'src/app/demo/service/auth.service';
import { GoallistService } from 'src/app/demo/service/goallists.service';
import { GoalService } from 'src/app/demo/service/goal.service';
import { customTitleCase } from 'src/app/utlis/custom-title-case';
@Component({
    selector: 'app-add-goal',
    templateUrl: './add-goal.component.html',
    styleUrl: './add-goal.component.scss',
})
export class AddGoalComponent implements OnInit, OnDestroy {
    @Input() addNewGoal: string;
    @Output() childAddGoalEvent = new EventEmitter<object>();
    private addGoalSubscription = new Subject<void>();
    public addGoalform: FormGroup;
    formGroupDemo: any;
    deptDropdownValue: any[] = [];
    formGroupCampus: any;
    deptDropdownCampusValue: any[] = [];
    deptDropdownGoalListValue: any[] = [];
    addGoalDialogCard: boolean = false;
    addGoalTrigger: any;
    customGoalName: string;
    USERID: string;
    selectedGoalId: any;
    customstrageticObjectiveName: string;
    strategicObjectiveList: any;
    originalStrategicObjective: any;
    filteredStrategicObjectiveList: any;

    constructor(
        private formBuilder: FormBuilder,
        private dept: DepartmentService,
        private messageService: MessageService,
        private camp: CampusService,
        private auth: AuthService,
        private goallistService: GoallistService,
        private goal: GoalService
    ) {
        this.USERID = this.auth.getTokenUserID();
    }

    ngOnInit() {
        this.createAddGoalForm();
        this.initializeDropdown();
        this.getAllCampuses();
        this.getAllDept();
        this.getAllGoallistsDropdown();
    }

    initializeDropdown() {
        this.formGroupDemo = new FormGroup({
            selectDepartment: new FormControl(),
        });
        this.formGroupCampus = new FormGroup({
            selectedCampus: new FormControl(),
        });
    }

    //
    getAllGoallistsDropdown() {
        this.goallistService
            .getRoute('get', 'goallists', 'getAllGoallistsDropdown')
            .pipe(takeUntil(this.addGoalSubscription))
            .subscribe({
                next: (data: any) => {
                    this.deptDropdownGoalListValue = data.data[0].map(
                        (item) => ({
                            ...item,
                            name: customTitleCase(item.name),
                        })
                    );
                    this.originalStrategicObjective =
                        this.strategicObjectiveList = data.data[0].flatMap(
                            (e: any) =>
                                e.objectives.map((objective: any) => ({
                                    ...objective,
                                    name: customTitleCase(objective.name),
                                }))
                        );
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to Goallist Dropdown',
                    }); // Display error message
                },
                complete: () => {},
            });
    }

    // campus dropdown
    getAllCampuses() {
        this.camp
            .fetch('get', 'campus', 'getAllCampus')
            .pipe(takeUntil(this.addGoalSubscription))
            .subscribe({
                next: (data: any) => {
                    this.deptDropdownCampusValue = data.data[0];
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to Campus Dropdown',
                    }); // Display error message
                },
                complete: () => {},
            });
    }

    // department dropdown
    getAllDept() {
        this.dept
            .getRoute('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.addGoalSubscription))
            .subscribe({
                next: (data: any) => {
                    this.deptDropdownValue = data.data[0];
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to Department Dropdown',
                    }); // Display error message
                },
                complete: () => {},
            });
    }

    createAddGoalForm() {
        this.addGoalform = this.formBuilder.group({
            goals: ['', [Validators.required]],
            strategic_objective: ['', [Validators.required]],
            // budget: ['', [Validators.required]],
            campus: ['', [Validators.required]],
            department: ['', [Validators.required]],
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.addGoalTrigger = changes['addNewGoal']?.currentValue;
        if (this.addGoalTrigger && this.addGoalTrigger.addGoal) {
            this.addGoalDialogCard = this.addGoalTrigger.addGoal;
        }
    }

    addGoalDialogExec(form: FormGroup) {
        let data = {
            goals: form.value.goals.name || this.customGoalName,
            strategic_objective:
                form.value.strategic_objective.name ||
                this.customstrageticObjectiveName,
            strategic_id: form.value.strategic_objective.id,
            campus: this.formGroupCampus.value.selectedCampus.name,
            department: this.formGroupDemo.value.selectDepartment.name,
            createdBy: this.USERID,
            goallistsId: this.selectedGoalId || '',
        };
        console.log('addGoalDialogExec', data);

        if (data.goals === '' || data.campus === '' || data.department === '') {
            // Handle the error (display a message, log to console, etc.)
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error: One or more required fields are missing or empty.',
            }); // Display error message
            return; // Stop further execution
        }

        this.goal
            .fetch('post', 'vice_president_query', 'addGoals', data)
            .pipe(takeUntil(this.addGoalSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    // this.getAllObjectivesWithObjectives();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.addGoalDialogCard = false;
                    this.addGoalform.reset();
                    this.formGroupDemo.reset();
                    this.formGroupCampus.reset();
                    this.childAddGoalEvent.emit({
                        success: true,
                        message: 'Added Goal Successfully',
                        userId: this.USERID,
                    });
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    onHide() {
        this.addGoalDialogCard = false;
    }

    // Goal Dropdown
    onGoalChange(event: any) {
        //ever change set the goal back to the original list
        this.strategicObjectiveList = this.originalStrategicObjective;
        if (event.value) {
            this.selectedGoalId = event.value.id;
            this.filterStrategicObjectives(event.value.id);
        }
    }

    filterStrategicObjectives(goal_id: any) {
        this.filteredStrategicObjectiveList =
            this.strategicObjectiveList.filter(
                (objective) => objective.goal_id === goal_id
            );
        this.strategicObjectiveList = this.filteredStrategicObjectiveList;
    }

    ngOnDestroy(): void {
        this.addGoalSubscription.next();
        this.addGoalSubscription.complete();
    }
}

/*
   getAllGoallistsDropdown() {
        this.goallistService
            .getRoute('get', 'goallists', 'getAllGoallistsDropdown')
            .pipe(takeUntil(this.addGoalSubscription))
            .subscribe({
                next: (data: any) => {
                    this.deptDropdownGoalListValue = data.data[0];
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to Goallist Dropdown',
                    }); // Display error message
                },
                complete: () => {},
            });
    }
*/
