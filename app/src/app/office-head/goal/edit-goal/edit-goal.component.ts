import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    SimpleChanges,
    Output,
    EventEmitter,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { GoalService } from 'src/app/demo/service/goal.service';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { CampusService } from 'src/app/demo/service/campus.service';

@Component({
    selector: 'app-edit-goal',
    templateUrl: './edit-goal.component.html',
    styleUrl: './edit-goal.component.scss',
})
export class EditGoalComponent implements OnInit, OnDestroy {
    @Input() editGoal: string;

    @Output() childEditGoalEvent = new EventEmitter<object>();

    private updateGoalSubscription = new Subject<void>();

    updateGoalDialogCard: boolean = false;
    updateGoalform: FormGroup;
    formGroupDemo: FormGroup;
    formGroupCampus: FormGroup;
    deptDropdownValue: any[] = [];
    deptDropdownCampusValue: any[] = [];
    updateGoalID: string;
    editGoalTrigger: any;
    goalName: any;
    goalId: any;
    constructor(
        private messageService: MessageService,
        private goal: GoalService,
        private formBuilder: FormBuilder,
        private dept: DepartmentService,
        private campus: CampusService
    ) {
        this.getAllDept();
        this.getAllCampuses();
        this.createUpdateGoalForm();

        this.formGroupDemo = new FormGroup({
            selectDepartment: new FormControl(),
        });
        this.formGroupCampus = new FormGroup({
            selectedCampus: new FormControl(),
        });
    }

    ngOnInit(): void {}
    ngOnDestroy(): void {
        this.updateGoalSubscription.next();
        this.updateGoalSubscription.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.editGoalTrigger = changes['editGoal']?.currentValue;
        let goal = changes['editGoal']?.currentValue?.goal;
        this.goalName = goal?.goals;
        this.goalId = goal?.id;

        if (this.editGoalTrigger && this.editGoalTrigger.editGoal) {
            this.formGroupDemo.setValue({
                selectDepartment: this.deptDropdownValue.find(
                    (dept) => dept.name === goal.department
                ),
            });
            this.formGroupCampus.setValue({
                selectedCampus: this.deptDropdownCampusValue.find(
                    (dept) => dept.name === goal.campus
                ),
            });

            this.updateGoalform = this.formBuilder.group({
                goals: [goal.goals],
                // goals: [goal.goals || '', [Validators.required]],
                budget: [goal.budget || 0, [Validators.required]],
            });
            this.updateGoalform.get('goals')?.disable();
            this.updateGoalDialogCard = true;
        }
    }

    createUpdateGoalForm() {
        this.updateGoalform = this.formBuilder.group({
            goals: ['', [Validators.required]],
            budget: ['', [Validators.required]],
            campus: ['', [Validators.required]],
        });
    }

    getAllDept() {
        this.dept
            .getRoute('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.updateGoalSubscription))
            .subscribe((data: any) => {
                this.deptDropdownValue = data?.data[0];
            });
    }

    getAllCampuses() {
        this.campus
            .fetch('get', 'campus', 'getAllCampus')
            .pipe(takeUntil(this.updateGoalSubscription))
            .subscribe((data: any) => {
                this.deptDropdownCampusValue = data.data[0];
            });
    }

    updateGoalDialogExec(form: any) {
        let data = {
            id: this.goalId,
            // no edit assign manually
            goals: this.goalName,
            // goals: form.value.goals,
            budget: form.value.budget,
            department: this.formGroupDemo.value.selectDepartment.name,
            campus: this.formGroupCampus.value.selectedCampus.name,
        };
        this.goal
            .fetch('put', 'goals', 'updateGoals', data)
            .pipe(takeUntil(this.updateGoalSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    // this.getAllObjectivesWithObjectives();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.updateGoalDialogCard = false;
                    this.childEditGoalEvent.emit({
                        success: true,
                        data: data.data,
                    });
                    this.updateGoalform.reset();
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }
}
