import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    SimpleChanges,
    Output,
    EventEmitter,
} from '@angular/core';
import { AuthService } from 'src/app/demo/service/auth.service';
import { Subject, pipe, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { GoallistService } from 'src/app/demo/service/goallists.service';
import { GoalService } from 'src/app/demo/service/goal.service';
import { get } from 'lodash';
import { customTitleCase } from 'src/app/utlis/custom-title-case';
import {
    populateAndUpdateData,
    addMonthlyControls,
    addQuarterlyControls,
    addSemiAnnualControls,
    addYearlyControls,
    clearDynamicControls,
    addMonthlyControlsSimple,
    addYearlyControlsSimple,
    addQuarterlyControlsSimple,
    addSemiAnnualControlsSimple,
} from 'src/app/utlis/general-utils';
@Component({
    selector: 'app-add-objective',
    templateUrl: './add-objective.component.html',
    styleUrl: './add-objective.component.scss',
})
export class AddObjectiveComponent implements OnInit, OnDestroy {
    @Input() addNewObjective: string;
    @Output() childAddObjectiveEvent = new EventEmitter<object>();
    addGoalTrigger: any;
    addObjectiveGoalform: FormGroup;
    formGroupDropdown: FormGroup;
    addObjectiveGoalDialogCard: boolean = false;
    dropdwonSelection: { name: string; code: string }[];
    dropdwonGoallistSelection: { name: string; code: string }[];
    USERID: string;
    private addObjectiveSubscription = new Subject<void>();
    subObjectiveGoalID: string;
    goal_ObjectId: string;
    customFunctionalName: string;
    goalDataRemainingBudget: number = 0;
    addExecutionGoalId: string;
    addExecutionGoal_Id: any;
    frequencyOptions = [
        { name: 'yearly', code: 'yearly' },
        { name: 'quarterly', code: 'quarterly' },
        { name: 'semi_annual', code: 'semi_annual' },
        { name: 'monthly', code: 'monthly' },
    ];

    months: string[] = [];
    quarters: string[] = [];
    semi_annual: string[] = [];
    yearly: string[] = [];
    targetValSwitch: boolean = false;
    typeOfComputationValSwitch: boolean = false;
    targetValPercentSwitch: Boolean = false;
    targetValCountSwitch: Boolean = false;
    typeOfComputationValCumulativeSwitch: Boolean = false;
    typeOfComputationValNonCumulativeSwitch: Boolean = false;

    selectedTargetType: any;

    targetTypes: any[] = [
        { name: 'percent', code: 'percent' },
        { name: 'count', code: 'count' },
    ];

    typeOfComputations: any[] = [
        { name: 'cumulative', code: 'cumulative' },
        { name: 'non-cumulative', code: 'non-cumulative' },
    ];

    constructor(
        private formBuilder: FormBuilder,
        private messageService: MessageService,
        private auth: AuthService,
        private obj: ObjectiveService,
        private goallistService: GoallistService,
        private goals: GoalService
    ) {
        this.USERID = this.auth.getTokenUserID();

        for (let month = 0; month < 12; month++) {
            this.months.push(
                new Date(0, month).toLocaleString('default', { month: 'short' })
            );
        }

        // Initialize quarters array
        this.quarters = [
            'Q1 (Jan-Mar)',
            'Q2 (Apr-Jun)',
            'Q3 (Jul-Sep)',
            'Q4 (Oct-Dec)',
        ];
        this.semi_annual = [
            '(Jan-Feb-Mar-Apr-May-Jun)',
            '(Jul-Aug-Sep-Oct-Nov-Dec)',
        ];

        this.yearly = ['Year'];

        // Initialize yearly array
        this.yearly = ['yearly'];

        this.targetValCountSwitch = true;
        this.typeOfComputationValNonCumulativeSwitch = true;
    }

    ngOnInit() {
        this.createAddObjectiveGoalform();
        this.formGroupDropdown = new FormGroup({
            selectedDropdown: new FormControl(),
        });
        this.dropdwonSelection = [
            { name: 'daily', code: 'Daily' },
            { name: 'weekly', code: 'Weekly' },
            { name: 'monthly', code: 'Monthly' },
            { name: 'yearly', code: 'Yearly' },
            { name: 'quarterly', code: 'Quarterly' },
            { name: 'biannually', code: 'Biannually' },
        ];
        // Disable the strategic_objective form control

        this.addObjectiveGoalform
            .get('target_type')
            .setValue(this.targetTypes[1].name);
        this.addObjectiveGoalform
            .get('type_of_computation')
            .setValue(this.typeOfComputations[1].name);
    }

    ngOnDestroy(): void {
        this.addObjectiveSubscription.next();
        this.addObjectiveSubscription.complete();
    }

    async ngOnChanges(changes: SimpleChanges) {
        this.addGoalTrigger = changes['addNewObjective']?.currentValue;

        let id = this.addGoalTrigger?.goallistsId;
        this.addExecutionGoalId = this.addGoalTrigger?.goalId;
        this.addExecutionGoal_Id = this.addGoalTrigger?.goal_ObjectId;
        if (
            this.addGoalTrigger?.addObjective &&
            this.addGoalTrigger?.goallistsId
        ) {
            // Ensure the form is initialized
            if (!this.addObjectiveGoalform) {
                this.createAddObjectiveGoalform();
            }
            // this.getAllGoallistsDropdown(id);
            this.getTheGoalData(
                this.addExecutionGoalId || this.addGoalTrigger?.goalId
            );
            this.addObjectiveGoalform.get('strategic_objective').disable();
            setTimeout(() => {
                this.addObjectiveGoalDialogCard = true;
            }, 0);
        }
    }

    getTheGoalData(goal: string) {
        this.goals
            .fetch('get', 'goals', `getGoalForCreatingObjective/${goal}`)
            .pipe(takeUntil(this.addObjectiveSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.addObjectiveGoalform.patchValue({
                        strategic_objective: customTitleCase(
                            data.goal.strategic_objective
                        ),
                    });
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Failed',
                        detail: 'Failed to get goal data',
                    });
                }
            });
    }

    onFrequencyChange(event: any) {
        const frequency = event.value.name;

        // Clear existing dynamic controls
        // this.clearDynamicControls();
        clearDynamicControls(
            this.addObjectiveGoalform,
            this.months,
            this.quarters,
            this.semi_annual,
            this.yearly
        );

        if (frequency === 'yearly') {
            addYearlyControlsSimple(this.addObjectiveGoalform, this.yearly);
        } else if (frequency === 'quarterly') {
            addQuarterlyControlsSimple(
                this.addObjectiveGoalform,
                this.quarters
            );
        } else if (frequency === 'semi_annual') {
            addSemiAnnualControlsSimple(
                this.addObjectiveGoalform,
                this.semi_annual
            );
        } else if (frequency === 'monthly') {
            addMonthlyControlsSimple(this.addObjectiveGoalform, this.months);
        }

        // if (frequency === 'yearly') {
        //     this.addYearlyControls();
        // } else if (frequency === 'quarterly') {
        //     this.addQuarterlyControls();
        // } else if (frequency === 'semi_annual') {
        //     this.addSemiAnnualControls();
        // } else if (frequency === 'monthly') {
        //     this.addMonthlyControls();
        // }

        // Update the form control value
        this.addObjectiveGoalform
            .get('frequency_monitoring')
            .setValue(frequency);
    }

    // clearDynamicControls() {
    //     this.months.forEach((_, i) => {
    //         if (this.addObjectiveGoalform.contains(`month_${i}`)) {
    //             this.addObjectiveGoalform.removeControl(`month_${i}`);
    //         }
    //     });
    //     this.quarters.forEach((_, i) => {
    //         if (this.addObjectiveGoalform.contains(`quarter_${i}`)) {
    //             this.addObjectiveGoalform.removeControl(`quarter_${i}`);
    //         }
    //     });
    //     this.semi_annual.forEach((_, i) => {
    //         if (this.addObjectiveGoalform.contains(`semi_annual_${i}`)) {
    //             this.addObjectiveGoalform.removeControl(`semi_annual_${i}`);
    //         }
    //     });
    //     this.yearly.forEach((_, i) => {
    //         if (this.addObjectiveGoalform.contains(`yearly_${i}`)) {
    //             this.addObjectiveGoalform.removeControl(`yearly_${i}`);
    //         }
    //     });
    // }

    // addMonthlyControls() {
    //     this.months.forEach((_, i) => {
    //         this.addObjectiveGoalform.addControl(
    //             `month_${i}`,
    //             new FormControl(0, Validators.min(0))
    //         );
    //     });
    // }

    // addYearlyControls() {
    //     this.yearly.forEach((_, i) => {
    //         this.addObjectiveGoalform.addControl(
    //             `yearly_${i}`,
    //             new FormControl(0, Validators.min(0))
    //         );
    //     });
    // }

    // addQuarterlyControls() {
    //     this.quarters.forEach((_, i) => {
    //         this.addObjectiveGoalform.addControl(
    //             `quarter_${i}`,
    //             new FormControl(0, Validators.min(0))
    //         );
    //     });
    // }

    // addSemiAnnualControls() {
    //     this.semi_annual.forEach((_, i) => {
    //         this.addObjectiveGoalform.addControl(
    //             `semi_annual_${i}`,
    //             new FormControl(0, Validators.min(0))
    //         );
    //     });
    // }

    ngAfterViewInit() {}

    createAddObjectiveGoalform() {
        this.addObjectiveGoalform = this.formBuilder.group({
            userId: ['', [Validators.required]],
            goalId: ['', [Validators.required]],
            strategic_objective: [
                { value: '', disabled: true },
                [Validators.required],
            ],
            functional_objective: ['', [Validators.required]],
            performance_indicator: ['', [Validators.required]],
            target: ['', [Validators.required]],
            formula: ['', [Validators.required]],
            programs: ['', [Validators.required]],
            responsible_persons: ['', [Validators.required]],
            // clients: ['', [Validators.required]],
            frequency_monitoring: ['', [Validators.required]],
            data_source: ['', [Validators.required]],
            remarks: ['', [Validators.required]],
            budget: ['', [Validators.required]],
            target_type: ['', [Validators.required]],
            type_of_computation: ['', [Validators.required]],
            // Add form controls for monthly and quarterly timetable values
            month_0: [0],
            month_1: [0],
            month_2: [0],
            month_3: [0],
            month_4: [0],
            month_5: [0],
            month_6: [0],
            month_7: [0],
            month_8: [0],
            month_9: [0],
            month_10: [0],
            month_11: [0],
            yearly_0: [0],
            quarter_0: [0],
            quarter_1: [0],
            quarter_2: [0],
            quarter_3: [0],

            semi_annual_1: [0],
            semi_annual_0: [0],
        });
    }

    clearAddObjectiveGoalDialogCardDatas() {
        this.addObjectiveGoalDialogCard = false;
        this.addObjectiveGoalform.reset();
    }
    async addSubObjectiveGoalDialogExec(e: any) {
        // Enable the strategic_objective form control before accessing the form value
        this.addObjectiveGoalform.get('strategic_objective').enable();
        let patterns = [];
        if (e.value.frequency_monitoring === 'semi_annual') {
            patterns.push('semi_annual_[i]');
        }
        if (e.value.frequency_monitoring === 'monthly') {
            patterns.push('month_[i]');
        }
        if (e.value.frequency_monitoring === 'yearly') {
            patterns.push('yearly_[i]');
        }
        if (e.value.frequency_monitoring === 'quarterly') {
            patterns.push('quarter_[i]');
        }

        const {
            addExecutionGoalId,
            formGroupDropdown,
            goal_ObjectId,
            USERID,
            targetValSwitch,
            typeOfComputationValSwitch,
        } = this;

        let data = {
            ...e.value,
            userId: USERID,
            goalId: addExecutionGoalId,
            goal_Id: this.addExecutionGoal_Id,
            createdBy: USERID,
            target_type: !targetValSwitch ? 'percent' : targetValSwitch,
            type_of_computation: !typeOfComputationValSwitch
                ? 'cumulative'
                : typeOfComputationValSwitch,
        };

        const updatedData = await this.addGoalPeriods(data, patterns);

        this.obj
            .fetch('post', 'objectives', 'addObjectives', updatedData)
            .pipe(takeUntil(this.addObjectiveSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.addObjectiveGoalDialogCard = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.goal_ObjectId = data.data.goal_Id;
                    this.addObjectiveGoalform.reset();
                    this.formGroupDropdown.reset();
                    this.goalDataRemainingBudget = 0;
                    this.childAddObjectiveEvent.emit(data.data.goalId);
                } else {
                    this.messageService.add({
                        severity: 'warn',
                    });
                }
            });
    }

    onGoalChange(event: any) {
        // capture here the goallist id if needed
    }

    async addGoalPeriods(obj: any, patterns: string[]) {
        const newObj = { ...obj }; // Create a copy of the original object

        patterns.forEach((pattern) => {
            const regex = new RegExp(`^${pattern.replace('[i]', '(\\d+)')}$`);

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const match = key.match(regex);
                    if (match) {
                        const periodIndex = match[1];
                        newObj[`goal_${pattern.replace('[i]', periodIndex)}`] =
                            obj[key];
                        newObj[key] = 0; // Set the value to 0
                    }
                }
            }
        });

        return newObj;
    }
}

/*
// async getAllGoallistsDropdown(id: string) {
    //     this.goallistService
    //         .getRoute(
    //             'get',
    //             'goallists',
    //             `getAllAddObjectivesGoallistsDropdown/${id}`
    //         )
    //         .pipe(takeUntil(this.addObjectiveSubscription))
    //         .subscribe({
    //             next: (data: any) => {

    //                 console.log({ data });

    //                 this.dropdwonGoallistSelection = data.objectives;
    //             },
    //             error: (error) => {
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'Failed to Goallist Dropdown',
    //                 });
    //             },
    //             complete: () => {},
    //         });
    // }
*/
