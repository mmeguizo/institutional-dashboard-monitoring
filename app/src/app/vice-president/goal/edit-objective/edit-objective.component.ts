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
import { FileService } from 'src/app/demo/service/file.service';
import { ChangeDetectorRef } from '@angular/core';
import {
    clearDynamicControls,
    addMonthlyControls,
    addQuarterlyControls,
    addSemiAnnualControls,
    addYearlyControls,
} from 'src/app/utlis/general-utils';

@Component({
    selector: 'app-edit-objective',
    templateUrl: './edit-objective.component.html',
    styleUrl: './edit-objective.component.scss',
})
export class EditObjectiveComponent implements OnInit, OnDestroy {
    @Input() getObjective: string;
    @Output() childUpdateObjective = new EventEmitter<object>();
    editGoalTrigger: any;
    editObjectiveGoalform: FormGroup;
    formGroupDropdown: FormGroup;
    editObjectiveGoalDialogCard: boolean = false;
    dropdwonSelection: { name: string; code: string }[];
    dropdwonGoallistSelection: { name: string; code: string }[];
    USERID: string;
    private updateObjectiveSubscription = new Subject<void>();
    subObjectiveGoalID: string;
    goal_ObjectId: string;
    customFunctionalName: string;
    goalDataRemainingBudget: number = 0;
    addExecutionGoalId: string;
    addExecutionGoal_Id: any;
    functional_objectiveMatchingDropdown: any;
    tobeUpdatedSubGoal: any;
    selectedfrequencyOptions: {
        name: string;
        code: string;
    };

    frequencyOptions = [
        { name: 'yearly', code: 'yearly' },
        { name: 'quarterly', code: 'quarterly' },
        { name: 'semi_annual', code: 'semi_annual' },
        { name: 'monthly', code: 'monthly' },
    ];
    months: string[] = [];
    quarters: string[] = [];
    semi_annual: string[] = [];
    file_semi_annual: string[] = [];
    yearly: string[] = [];

    // file service
    uploadedFiles: any[] = [];
    addFileTrigger: any;
    userID: string;
    objectiveIDforFile: any;
    AllObjectivesFiles: any[] = [];
    loading: boolean;
    disableUpload: boolean = false;
    uploadSuccessFlag: boolean = false;

    // file service child
    showAddFilesComponent = false;
    parentAddnewFile: any;
    uploadInProgress: boolean = false;
    counter: number = 0;
    objectiveData: any;
    objectiveDatas: any;
    constructor(
        private formBuilder: FormBuilder,
        private messageService: MessageService,
        private auth: AuthService,
        private obj: ObjectiveService,
        private goallistService: GoallistService,
        private fileService: FileService,
        private cdr: ChangeDetectorRef
    ) {
        this.USERID = this.auth.getTokenUserID();

        for (let month = 0; month < 12; month++) {
            this.months.push(
                new Date(0, month).toLocaleString('default', { month: 'short' })
            );
        }

        // Initialize quarters array
        this.quarters = ['quarter_0', 'quarter_1', 'quarter_2', 'quarter_3'];
        this.semi_annual = ['semi_annual_0', 'semi_annual_1'];
        this.file_semi_annual = ['file_semi_annual_0', 'file_semi_annual_1'];
        this.yearly = ['yearly_0'];
    }

    ngOnInit() {
        this.createeditObjectiveGoalform();
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
        this.uploadSuccessFlag = false;
    }
    ngOnDestroy(): void {
        this.updateObjectiveSubscription.next();
        this.updateObjectiveSubscription.complete();
    }

    async ngOnChanges(changes: SimpleChanges) {
        // add this to make sure it will not detect the previous value only current value
        if (changes['getObjective']?.currentValue) {
            const { editObjective, data } =
                changes['getObjective']?.currentValue;
            if (editObjective && data) {
                const { id, goalId, frequency_monitoring } = data;
                this.goal_ObjectId = goalId;
                this.tobeUpdatedSubGoal = id;
                await this.getObjectiveById(id, frequency_monitoring);
                // Update the form control valueks
            }
        }
    }

    async onFrequencyChange(event: any, data?: any) {
        const frequency = event?.value?.name || event;
        this.selectedfrequencyOptions = {
            name: event?.value?.name || event,
            code: event?.value?.name || event,
        };
        // Clear existing dynamic controls
        // await this.clearDynamicControls();
        await clearDynamicControls(
            this.editObjectiveGoalform,
            this.months,
            this.quarters,
            this.semi_annual,
            this.yearly
        );

        if (frequency === 'monthly') {
            // await this.addMonthlyControls(await data);
            await addMonthlyControls(
                this.editObjectiveGoalform,
                this.months,
                await data
            );
        } else if (frequency === 'quarterly') {
            // await this.addQuarterlyControls(await data);
            await addQuarterlyControls(
                this.editObjectiveGoalform,
                this.quarters,
                await data
            );
        } else if (frequency === 'semi_annual') {
            // await this.addSemiAnnualControls(await data);
            await addSemiAnnualControls(
                this.editObjectiveGoalform,
                this.semi_annual,
                await data
            );
        } else {
            // await this.addYearlyControls(await data);
            await addYearlyControls(
                this.editObjectiveGoalform,
                this.yearly,
                await data
            );
        }
    }

    async getObjectiveById(id: string, frequency_monitoring: string) {
        this.obj
            .fetch('get', 'objectives', `getObjectiveById/${id}`)
            .pipe(takeUntil(this.updateObjectiveSubscription))
            .subscribe((data: any) => {
                this.objectiveDatas = data.data;
                this.onFrequencyChange(frequency_monitoring, data.data);
                this.editObjectiveGoalform
                    .get('frequency_monitoring')
                    .setValue(frequency_monitoring);
                //add delay to prepare the forms
                setTimeout(() => {
                    this.editObjectiveGoalDialogCard = true;
                    this.cdr.detectChanges();
                }, 300);
            });
    }

    createeditObjectiveGoalform() {
        this.editObjectiveGoalform = this.formBuilder.group({
            // department: ['', [Validators.required]],
            // userId: ['', [Validators.required]],
            // goalId: ['', [Validators.required]],
            // functional_objective: ['', [Validators.required]],
            // performance_indicator: ['', [Validators.required]],
            // target: ['', [Validators.required]],
            // formula: ['', [Validators.required]],
            // programs: ['', [Validators.required]],
            // responsible_persons: ['', [Validators.required]],
            // clients: ['', [Validators.required]],
            // timetable: ['', [Validators.required]],
            frequency_monitoring: ['', [Validators.required]],
            // data_source: ['', [Validators.required]],
            // remarks: ['', [Validators.required]],
            // budget: ['', [Validators.required]],
        });
    }
    clearEditObjectiveGoalDialogCardDatas() {
        //reset the form so no data will be left off before getting a new one
        // this.editObjectiveGoalform.reset();
        this.editObjectiveGoalDialogCard = false;
    }

    updateSubObjectiveGoalDialogExec(form: any) {
        form.value.id = this.tobeUpdatedSubGoal;
        form.value.goalId = this.goal_ObjectId;
        let data = {};
        const currentDate = new Date().toISOString().split('T')[0];

        for (const key in form.value) {
            if (form.value[key] !== '') {
                data[key] = form.value[key];

                if (
                    key.includes('file') &&
                    key.includes(form.value.frequency_monitoring)
                ) {
                    data[key] = '💾 File Added...';
                    if (!key.includes(form.value.frequency_monitoring)) {
                        delete data[key];
                    }
                }

                if (
                    form.value.frequency_monitoring === 'monthly' &&
                    key.startsWith('month_')
                ) {
                    const index = key.split('_')[1];
                    data[`month_${index}_date`] = currentDate;
                } else if (
                    form.value.frequency_monitoring === 'quarterly' &&
                    key.startsWith('quarter_')
                ) {
                    const index = key.split('_')[1];
                    data[`quarter_${index}_date`] = currentDate;
                } else if (
                    form.value.frequency_monitoring === 'semi_annual' &&
                    key.startsWith('semi_annual_')
                ) {
                    const index = key.split('_')[2];
                    data[`semi_annual_${index}_date`] = currentDate;
                } else if (
                    form.value.frequency_monitoring === 'yearly' &&
                    key.startsWith('yearly_')
                ) {
                    const index = key.split('_')[1];
                    data[`yearly_${index}_date`] = currentDate;
                }
            }
        }

        this.obj
            .fetch('put', 'objectives', 'updateObjectives', data)
            .pipe(takeUntil(this.updateObjectiveSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    //close the objective table
                    this.editObjectiveGoalDialogCard = false;
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.childUpdateObjective.emit({
                        success: true,
                        id: data.data?.goalId,
                    });
                    //reset the form so no data will be left off before getting a new one
                    // this.editObjectiveGoalform.reset();
                    this.cdr.detectChanges();
                    //reset the flag
                    this.uploadSuccessFlag = false;
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    onGoalChange(event: any) {
        // capture here the goallist id if needed
    }

    onUpload(event: any, type: string, index: number) {
        this.showAddFilesComponent = true;
        this.parentAddnewFile = {
            addFile: true,
            objectiveId: this.tobeUpdatedSubGoal,
            frequencyFileName: `file_${type}_${index}`,
        };
    }

    receivedAddFileEvent(event: any) {
        if (event) {
            //close the child component
            this.showAddFilesComponent = false;
        }
        // Handle the event when a file is added
        this.onFileUploadSuccess(
            event.frequencyFileName,
            event.frequencyFileNameForUpdate
        );
    }
    onFileUploadSuccess(controlName: string, fileName: string) {
        //hide the input and show the check icon
        this.uploadSuccessFlag = true;
        if (this.editObjectiveGoalform.contains(controlName)) {
            this.editObjectiveGoalform
                .get(controlName)
                .setValue('🏷️ File added hit submit');
        } else {
            this.editObjectiveGoalform.addControl(
                controlName,
                new FormControl(fileName)
            );
        }
    }
}
