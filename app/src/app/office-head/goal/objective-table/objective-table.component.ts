import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ChangeDetectorRef,
    ElementRef,
    ViewChild,
    SimpleChanges,
    EventEmitter,
    Output,
} from '@angular/core';
import {
    Subject,
    pipe,
    takeUntil,
    tap,
    catchError,
    Observable,
    throwError,
} from 'rxjs';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GoalService } from 'src/app/demo/service/goal.service';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { AuthService } from 'src/app/demo/service/auth.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { FileService } from 'src/app/demo/service/file.service';
import { FileUpload } from 'primeng/fileupload';
import { getIcon } from 'src/app/utlis/file-utils';
import { CampusService } from 'src/app/demo/service/campus.service';
import { customTitleCase } from 'src/app/utlis/custom-title-case';

@Component({
    selector: 'app-objective-table',
    templateUrl: './objective-table.component.html',
    styleUrl: './objective-table.component.scss',
})
export class ObjectiveTableComponent implements OnInit, OnDestroy {
    private objectiveTableSubscription = new Subject<void>();
    @Input() getObjective = new EventEmitter<any>();
    @Input() editObjective = new EventEmitter<any>();
    @Input() addNewSuccessObjective = new EventEmitter<any>();
    @Output() childAddObjectiveEvent = new EventEmitter<any>();
    @Output() childEditObjectiveEvent = new EventEmitter<any>();
    @Output() remarksEvent = new EventEmitter<any>();
    @Output() viewFilesEvent = new EventEmitter<any>();
    @Output() printObjectiveTableEvent = new EventEmitter<any>();
    @Output() printQOMObjectiveTableEvent = new EventEmitter<any>();

    subGoalObjective: boolean = false;
    loading: boolean = false;
    USERID: string;
    subOnjectiveHeaderData: any;
    getObjectiveTableTrigger: any;
    subObjectiveGoalID: any;
    goallistsId: any;
    goal_ObjectId: any;
    goalDataRemainingBudget: any;
    goalBudget: any;
    subObjectiveHeaders: any;
    objectiveDatas: any[] = [];
    addNewObjectiveTableTrigger: any;
    editObjectiveTableTrigger: any;
    currentDate = new Date();
    // childAddObjectiveEvent: any;

    constructor(
        private objective: ObjectiveService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private auth: AuthService,
        private department: DepartmentService,
        private goal: GoalService,
        private campus: CampusService,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loading = true;
        this.USERID = this.auth.getTokenUserID();
    }

    ngOnDestroy() {
        this.objectiveTableSubscription.next();
        this.objectiveTableSubscription.complete();
        this.objectiveTableSubscription.unsubscribe();
    }

    hideViewObjectiveTable(id?: string) {
        this.subGoalObjective = false;
    }
    ngOnChanges(changes: SimpleChanges) {
        this.getObjectiveTableTrigger = changes['getObjective']?.currentValue;
        this.addNewObjectiveTableTrigger =
            changes['addNewSuccessObjective']?.currentValue;
        this.editObjectiveTableTrigger = changes['editObjective']?.currentValue;

        if (
            this.getObjectiveTableTrigger &&
            this.getObjectiveTableTrigger.getObjective
        ) {
            const {
                id: id,
                _id: objectId,
                listsId: goallistsId,
                goal: subHeader,
                // remainingBudget: goalDataRemainingBudget,
                goalData: goalData,
            } = this.getObjectiveTableTrigger;

            this.loading = true;
            //passed data needed for the subgoal table or adding table modal
            this.subObjectiveGoalID = id;
            this.goallistsId = goallistsId;
            this.goal_ObjectId = objectId || goalData._id || '';
            //open the objective modal
            this.subGoalObjective = true;
            //remaining budget needed in adding objective input
            //headers in objective table

            this.subOnjectiveHeaderData = goalData;
            // this.goalDataRemainingBudget =
            //     goalDataRemainingBudget ||
            //     this.subOnjectiveHeaderData?.remainingBudget;
            this.goalBudget = this.subOnjectiveHeaderData?.budget;

            this.subObjectiveHeaders = customTitleCase(
                subHeader || this.subObjectiveHeaders || ''
            );

            this.getTableData(id);
        }

        if (
            this.addNewObjectiveTableTrigger &&
            this.addNewObjectiveTableTrigger.addedNewObjective
        ) {
            this.loading = true;
            this.getTableData(this.addNewObjectiveTableTrigger.data.goalId);
        }

        if (
            this.editObjectiveTableTrigger?.success &&
            this.editObjectiveTableTrigger?.id
        ) {
            const { success, id } = this.editObjectiveTableTrigger;
            this.loading = success;
            this.getTableData(id);
        }
    }
    getTableData(id: string) {
        //clear the table
        // this.objectiveDatas = [];
        if (id) {
            this.loading = true;
            this.objective
                .fetch('get', 'objectives', `getAllByIdObjectives/${id}`)
                .pipe(takeUntil(this.objectiveTableSubscription))
                .subscribe(async (data: any) => {
                    console.log('getAllByIdObjectives', data);
                    this.objectiveDatas = await data.Objectives;
                    this.changeDetectorRef.markForCheck();
                    this.loading = false;
                });
        }
    }

    addSubGoal(data?: any) {
        this.childAddObjectiveEvent.emit({
            addObjective: true,
            goallistsId: this.goallistsId,
            goalId: this.subObjectiveGoalID,
            goal_ObjectId: this.goal_ObjectId,
            data: data,
        });
    }

    deleteSubGoal(id: string, goalId: string) {
        this.confirmationService.confirm({
            key: 'deleteSubGoal',
            target: event.target || new EventTarget(),
            message: 'Deleting Objectives Will Delete All Files. Continue?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loading = true;
                this.goal
                    .fetch('put', 'objectives', 'setInactiveObjectives', {
                        id: id,
                    })
                    .pipe(takeUntil(this.objectiveTableSubscription))
                    .subscribe((data: any) => {
                        if (data.success) {
                            //tag is as changes so if close will recalculate the data
                            this.loading = false;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Done',
                                detail: data.message,
                            });
                            // Unsubscribe after getting the data
                            this.getTableData(goalId);
                            this.loading = false;
                            this.changeDetectorRef.detectChanges();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: data.message,
                            });
                            this.loading = false;
                        }
                    });
            },
            reject: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Done',
                    detail: 'Delete Cancelled',
                });
            },
        });
    }

    updateSubGoal(data: any) {
        this.childEditObjectiveEvent.emit({
            editObjective: true,
            data: data,
        });
    }

    viewFiles(objectives: any) {
        this.viewFilesEvent.emit({
            viewFiles: true,
            data: objectives,
        });
    }

    openRemarksDialog(data: any) {
        this.remarksEvent.emit({
            remarksDialogCard: true,
            data: data,
        });
    }

    printDocument(header: string, data: any) {
        //   this.printingHead = true;
        this.printObjectiveTableEvent.emit({
            printObjectiveTable: true,
            data: data,
            header: header,
        });
    }

    printDocumentQOM(header: string, data: any): void {
        console.log('printDocumentQOM');
        this.printQOMObjectiveTableEvent.emit({
            printQOMObjectiveTable: true,
            data: data,
            header: header,
        });
    }

    formatText(text: string) {
        return text.replace(/_/g, ' ');
    }
}
