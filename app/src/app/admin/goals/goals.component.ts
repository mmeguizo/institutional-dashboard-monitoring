import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
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
import { PrintTableComponent } from './print-table/print-table.component';
import { getIcon, getFrequencyKeys } from 'src/app/utlis/file-utils';
import { CampusService } from 'src/app/demo/service/campus.service';
@Component({
    selector: 'app-goals',
    templateUrl: './goals.component.html',
    styleUrl: './goals.component.scss',
})
export class GoalsComponent implements OnInit, OnDestroy {
    private getGoalSubscription = new Subject<void>();
    @ViewChild('filter') filter!: ElementRef;
    @ViewChild(PrintTableComponent) printTableComponent: PrintTableComponent;
    @Output() remarksEvent = new EventEmitter<any>();
    @Output() printQOMObjectiveTableEvent = new EventEmitter<any>();

    //table data
    goals: any[] = [];
    Alldepts: any[] = [];
    AllObjectivesFiles: any[] = [];
    AllObjectivesHistoryFiles: any[] = [];
    ViewBudget: any[] = [];
    deptDropdownCampusValue: any[] = [];
    parentRemarks: any;
    //table columns
    cols!: any;
    loading = false;
    currentDate = Date.now();
    //variables used in the component
    userID: string;
    updateGoalID: string;
    subObjectiveGoalID: string;
    subObjectiveHeaders: string;
    uploadedFiles: any[] = [];
    objectiveDatas: any;
    deptDropdownValue: any[] = [];
    ObjectivesGoals: any[] = [];

    //variables used in the table
    tobeUpdatedSubGoal: any;
    goal_ObjectId: string;
    frequencys: { name: string; code: string }[];

    //cards dialog
    subGoalObjective: boolean = false;
    addGoalDialogCard: boolean = false;
    addObjectiveGoalDialogCard: boolean = false;
    updateGoalDialogCard: boolean = false;
    viewObjectiveFileDialogCard: boolean = false;
    viewObjectiveFileHistoryDialogCard: boolean = false;
    addObjectiveFileDialogCard: boolean;
    updateObjectiveGoalFlag: boolean;
    parentPrintQom: any = {};
    //forms
    public addGoalform: any;
    public updateGoalform: any;
    public addObjectiveGoalform: any;
    public addFileForm: any;
    formGroupCampus: any;
    formGroupDemo: any;

    //dropdowns
    formGroupDropdown: any;
    frequency: { name: string; code: string }[];
    dropdwonSelection: { name: string; code: string }[];
    objectiveIDforFile: any;

    valSwitch: boolean = false;
    USERID: string;
    ROLE: string;
    hideviewObjectiveFileDialogCardID: any;

    // progress bar
    value = 0;
    interval: any;
    // goalDataRemainingBudget: number = 0;
    goalBudget: number = 0;
    // set initial value
    onclickCompletionButton = [];
    blockedPanel: boolean;
    subOnjectiveHeaderData: any;
    isPrintableVisible: boolean = false;
    printingHead: boolean = false;
    nameValue: string = ''; // Declare variables to hold values
    officeValue: string = '';
    printingOfficeName: string = '';

    //add goal child component
    parentAddnewGoal: any = {};
    parentEditGoal: any = {};
    parentupdateObjective: any = {};
    parentAddnewObjective: any = {};
    printFlag: boolean;
    goallistsId: string;

    // add files child component
    parentAddnewFile: any = {};
    parentPrintFile: any = {};
    parentPrintFileQom: any = {};

    frequencyOptions = [
        { name: 'yearly', code: 'yearly' },
        { name: 'quarterly', code: 'quarterly' },
        { name: 'semi_annual', code: 'semi_annual' },
        { name: 'monthly', code: 'monthly' },
    ];
    months: string[] = [];
    quarters: string[] = [];
    semi_annual: string[] = [];
    makeChanges: boolean;
    childComponentAddfileObjectiveId: any;

    constructor(
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService,
        private goal: GoalService,
        private auth: AuthService,
        private obj: ObjectiveService,
        private dept: DepartmentService,
        private fileService: FileService,
        private camp: CampusService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.USERID = this.auth.getTokenUserID();
        this.ROLE = this.auth.getUserRole();
    }

    ngOnInit() {
        this.getAllObjectivesWithObjectives();
        this.getAllDept();

        this.dropdwonSelection = [
            { name: 'daily', code: 'Daily' },
            { name: 'weekly', code: 'Weekly' },
            { name: 'monthly', code: 'Monthly' },
            { name: 'yearly', code: 'Yearly' },
            { name: 'quarterly', code: 'Quarterly' },
            { name: 'biannually', code: 'Biannually' },
        ];

        this.cols = [
            { field: 'goals', header: 'Goals' },
            { field: 'budget', header: 'Budget' },
            { field: 'department', header: 'Department' },
            { field: 'campus', header: 'Campus' },
            { field: 'createdBy', header: 'CreatedBy' },
            { field: 'createdAt', header: 'CreatedAt' },
            { field: 'options', header: 'Options' },
        ];

        this.createAddGoalForm();
        this.createUpdateGoalForm();
        this.createAddObjectiveGoalform();
        this.createaddFileForm();
        this.getAllCampuses();

        this.formGroupDropdown = new FormGroup({
            selectedDropdown: new FormControl(),
        });

        this.formGroupDemo = new FormGroup({
            selectDepartment: new FormControl(),
        });

        this.formGroupCampus = new FormGroup({
            selectedCampus: new FormControl(),
        });

        // progress bar
        this.interval = setInterval(() => {
            this.value = this.value + Math.floor(Math.random() * 10) + 1;
            if (this.value >= 100) {
                this.value = 100;
                clearInterval(this.interval);
            }
        }, 2000);
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.getGoalSubscription.unsubscribe();
    }

    createAddGoalForm() {
        this.addGoalform = this.formBuilder.group({
            goals: ['', [Validators.required]],
            budget: ['', [Validators.required]],
            campus: ['', [Validators.required]],
            department: ['', [Validators.required]],
        });
    }
    createaddFileForm() {
        this.addFileForm = this.formBuilder.group({
            files: ['', [Validators.required]],
        });
    }
    createAddObjectiveGoalform() {
        this.addObjectiveGoalform = this.formBuilder.group({
            // department: ['', [Validators.required]],
            userId: ['', [Validators.required]],
            goalId: ['', [Validators.required]],
            functional_objective: ['', [Validators.required]],
            performance_indicator: ['', [Validators.required]],
            target: ['', [Validators.required]],
            formula: ['', [Validators.required]],
            programs: ['', [Validators.required]],
            responsible_persons: ['', [Validators.required]],
            clients: ['', [Validators.required]],
            timetable: ['', [Validators.required]],
            frequency_monitoring: ['', [Validators.required]],
            data_source: ['', [Validators.required]],
            budget: ['', [Validators.required]],
        });
    }

    createUpdateGoalForm() {
        this.updateGoalform = this.formBuilder.group({
            goals: ['', [Validators.required]],
            budget: ['', [Validators.required]],
            campus: ['', [Validators.required]],
        });
    }

    getAllCampuses() {
        this.camp
            .fetch('get', 'campus', 'getAllCampus')
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.deptDropdownCampusValue = data.data[0];
            });
    }

    getAllObjectivesWithObjectives(): Subject<boolean> {
        const resultSubject = new Subject<boolean>(); // Create a new Subject to emit success or failure

        this.loading = true;
        this.goal
            .fetch('get', 'goals', 'getAllObjectivesWithObjectives')
            .pipe(
                takeUntil(this.getGoalSubscription),
                tap((data: any) => {
                    this.goals = data.goals;
                    this.loading = false;
                }),
                catchError((error) => {
                    this.loading = false; // Set loading to false on error
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error getAllObjectivesWithObjectives',
                        detail: error.message,
                    });
                    return throwError(() => error); // Re-throw the error if necessary
                })
            )
            .subscribe(); // Trigger the observable
        return resultSubject; // Return the subject to the caller
    }

    /*
     */

    getAllDept() {
        this.dept
            .getRoute('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.deptDropdownValue = data?.data[0];
            });
    }

    async getObjectives(
        id: string,
        objectId: string = '',
        goallistsId: string = '',
        subHeader: string = '',
        goalData: any = []
    ) {
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
        // this.goalBudget = this.subOnjectiveHeaderData?.budget;

        this.subObjectiveHeaders = this.customTitleCase(
            subHeader || this.subObjectiveHeaders || ''
        );

        //get all goals with subobjective
        this.loading = false;
        if (id) {
            this.loading = true;
            this.obj
                .fetch('get', 'objectives', `getAllByIdObjectives/${id}`)
                .pipe(takeUntil(this.getGoalSubscription))
                .subscribe(async (data: any) => {
                    console.log(data);
                    this.objectiveDatas = data.Objectives;
                    this.goalBudget = data.budget;
                    this.loading = false;
                });
        }
    }
    async getObjectivesReload(id: string) {
        //get all goals with subobjective
        if (id) {
            this.loading = true;
            this.obj
                .fetch('get', 'objectives', `getAllByIdObjectives/${id}`)
                .pipe(takeUntil(this.getGoalSubscription))
                .subscribe((data: any) => {
                    this.objectiveDatas = data.Objectives;
                    this.goalBudget = data.budget;
                    let subBudget = data.Objectives.reduce((acc, e) => {
                        return acc + e.budget;
                    }, 0);

                    // this.goalDataRemainingBudget = this.goalBudget - subBudget;
                    this.changeDetectorRef.detectChanges();
                    this.loading = false;
                    this.makeChanges = false;
                });
        }
    }

    async getAllFilesFromObjectiveLoad(
        id: string,
        objectiveID: string
    ): Promise<boolean> {
        try {
            this.loading = true;
            this.fileService
                .getAllFilesFromObjective(id, objectiveID)
                .pipe(takeUntil(this.getGoalSubscription))
                .subscribe((data: any) => {
                    this.AllObjectivesFiles = data.data;
                    this.loading = false;
                });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async getAllFilesHistoryFromObjectiveLoad(
        id: string,
        objectiveID: string
    ): Promise<Boolean> {
        this.loading = true;
        this.fileService
            .getAllFilesHistoryFromObjectiveLoad(id, objectiveID)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.AllObjectivesHistoryFiles = data.data;
                this.changeDetectorRef.detectChanges();
                this.loading = false;
            });
        return true;
    }

    addSubGoal(data?: any) {
        this.parentAddnewObjective = {
            addObjective: true,
            goallistsId: this.goallistsId,
            goalId: this.subObjectiveGoalID,
            goal_ObjectId: this.goal_ObjectId,
        };
    }

    addFiles(objectiveData: any) {
        this.parentAddnewFile = {
            addFile: true,
            objectiveId: this.childComponentAddfileObjectiveId,
        };
    }

    addGoal() {
        this.parentAddnewGoal = { addGoal: true };
    }

    updateGoal(goal) {
        this.parentEditGoal = {
            editGoal: true,
            goal: goal,
            updateGoalID: goal.id,
        };
    }

    updateSubGoal(data: any) {
        console.log({ updateSubGoal: data });
        this.parentupdateObjective = {
            editGoal: true,
            data,
        };
    }

    receivedUpdateObjective(editObjectiveMessageResults: any) {
        const { success, id: goalID } = editObjectiveMessageResults;
        //track if changes is made for the table to reload
        this.makeChanges = true;
        this.getObjectivesReload(goalID);
        this.getAllObjectivesWithObjectives();
    }

    deleteGoalDialog(event: Event, _id: any) {
        this.confirmationService.confirm({
            key: 'deleteGoal',
            target: event.target || new EventTarget(),
            message:
                'Stop! Deleting this goal will delete all objectives under it?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.goal
                    .fetch('put', 'goals', 'deleteGoals', { _id: _id })
                    .pipe(takeUntil(this.getGoalSubscription))
                    .subscribe((data: any) => {
                        if (data.success) {
                            this.getAllObjectivesWithObjectives();
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: data.message,
                            });
                            this.updateGoalDialogCard = false;
                            this.updateGoalform.reset();
                        } else {
                            this.messageService.add({
                                severity: 'error  ',
                                summary: 'Error',
                                detail: data.message,
                            });
                        }
                    });
            },
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
                    .pipe(takeUntil(this.getGoalSubscription))
                    .subscribe((data: any) => {
                        if (data.success) {
                            this.getObjectivesReload(goalId);
                            //tag is as changes so if close will recalculate the data
                            this.makeChanges = true;
                            this.loading = false;
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: data.message,
                            });
                            // this.updateGoalDialogCard = false;
                            // this.updateGoalform.reset();
                        } else {
                            this.messageService.add({
                                severity: 'error  ',
                                summary: 'Error',
                                detail: data.message,
                            });
                        }
                    });
            },
        });
    }

    deleteSubGoalFile(id: string, source: string) {
        // alert(`delete sub goal file ${id} ${source}`);
        this.confirmationService.confirm({
            key: 'deleteSubGoalFile',
            target: event.target || new EventTarget(),
            message: 'Delete File',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.fileService
                    .deleteFileObjective({
                        id: id,
                        source: source,
                    })
                    .pipe(takeUntil(this.getGoalSubscription))
                    .subscribe((data: any) => {
                        if (data.success) {
                            this.getAllFilesFromObjectiveLoad(
                                this.USERID,
                                this.objectiveIDforFile
                            );
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: data.message,
                            });
                        } else {
                            this.messageService.add({
                                severity: 'error  ',
                                summary: 'Error',
                                detail: data.message,
                            });
                        }
                    });
            },
        });
    }

    viewFiles(objectiveData: any) {
        //block view files if complete
        this.blockedPanel = objectiveData.complete;
        // alert(objectiveID);
        this.viewObjectiveFileDialogCard = true;
        this.objectiveIDforFile = objectiveData.id;
        //use this when triggering the child component for adding file
        this.childComponentAddfileObjectiveId = objectiveData.id;
        // alert(JSON.stringify(objectiveData));
        this.getAllFilesFromObjectiveLoad(this.USERID, objectiveData.id);
    }

    viewFilesHistory(objectiveData: any) {
        this.viewObjectiveFileHistoryDialogCard = true;
        this.getAllFilesHistoryFromObjectiveLoad(
            objectiveData?.users?.id,
            objectiveData.id
        );
    }

    clearAddObjectiveGoalDialogCardDatas() {
        this.addObjectiveGoalDialogCard = false;
        this.updateObjectiveGoalFlag = false;
        this.tobeUpdatedSubGoal = null;
        this.addObjectiveGoalform.reset();
    }

    hidviewObjectRefetch() {}

    hideViewObjectiveTable(id?: string) {
        this.subGoalObjective = false;
        this.subObjectiveGoalID = null;
        this.objectiveDatas = [];
        if (this.makeChanges) {
            this.getAllObjectivesWithObjectives().subscribe(
                (isSuccessful: boolean) => {
                    if (isSuccessful) {
                        this.makeChanges = false; // Reset makeChanges only if the operation was successful
                    } else {
                        // Handle error scenario if needed
                    }
                }
            );
        }
        //after they click the switch it and close the dialog will refetch
        // if (id) {
        //     this.hidviewObjectRefetch(id);
        // }
    }

    hideViewFileDialogCard() {
        // destroy the data needed on that dialog
        this.objectiveIDforFile = null;
        this.viewObjectiveFileDialogCard = false;
    }
    hideViewFileHistoryDialogCard() {
        this.viewObjectiveFileHistoryDialogCard = false;
    }

    getFrequencyKeys(objectiveFile: any) {
        return getFrequencyKeys(objectiveFile);
    }

    // viewObjectiveFileHistoryDialogCard

    getIcon(name: string) {
        return getIcon(name);
    }

    customTitleCase(str: string): string {
        // Split the string into words
        const words = str.split(/\s+/);
        const formattedWords = words.map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        // Join the formatted words back into a string
        return formattedWords.join(' ');
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    closeSubGoalTable() {
        this.subGoalObjective = false;
        this.objectiveDatas = [];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    receivedAddGoalEvent(addGoalMessageResults: any) {
        //track if changes is made for the table to reload
        this.makeChanges = true;
        if (addGoalMessageResults.success) {
            this.getAllObjectivesWithObjectives().subscribe(
                (isSuccessful: boolean) => {
                    if (isSuccessful) {
                        this.makeChanges = false; // Reset makeChanges only if the operation was successful
                    } else {
                        // Handle error scenario if needed
                    }
                }
            );
        }
    }
    receivedAddFileEvent(addNewFileEvent: any) {
        const { USERID, objectiveId, viewObjectiveFileDialogCard } =
            addNewFileEvent;

        this.loading = true;
        this.getAllFilesFromObjectiveLoad(USERID, objectiveId)
            .then((data: any) => {
                if (data.success) {
                    // Run the code below if the return is true
                    this.viewObjectiveFileDialogCard =
                        viewObjectiveFileDialogCard;
                    this.loading = false;
                } else {
                    // Notify if the return is false
                    // Handle error scenario if needed
                }
            })
            .catch((error: any) => {
                // Handle error scenario if needed
            });
    }

    receivedEditGoalEvent(editGoalMessageResults: any) {
        //track if changes is made for the table to reload
        this.makeChanges = true;
        this.getAllObjectivesWithObjectives().subscribe(
            (isSuccessful: boolean) => {
                if (isSuccessful) {
                    this.makeChanges = false; // Reset makeChanges only if the operation was successful
                } else {
                    // Handle error scenario if needed
                }
            }
        );
    }

    receivedAddObjectiveEvent(id: any) {
        //track if changes is made for the table to reload
        this.makeChanges = true;
        this.getObjectivesReload(id);
    }

    printDocument() {
        //   this.printingHead = true;
        this.parentPrintFile = {
            printFile: true,
            objectData: this.objectiveDatas,
            printingHead: true,
            subObjectiveHeaders: this.subObjectiveHeaders,
            subOnjectiveHeaderData: this.subOnjectiveHeaderData?.department,
            printingOfficeName: this.printingOfficeName,
        };
    }

    // printDocumentQOM() {
    //     //   this.printingHead = true;
    //     this.parentPrintFileQom = {
    //         printFile: true,
    //         objectData: this.objectiveDatas,
    //         printingHead: true,
    //         subObjectiveHeaders: this.subObjectiveHeaders,
    //         subOnjectiveHeaderData: this.subOnjectiveHeaderData?.department,
    //         printingOfficeName: this.printingOfficeName,
    //     };
    // }

    ngAfterViewInit() {}

    openRemarksDialog(event: any) {
        this.parentRemarks = {
            remarksDialogCard: true,
            data: event,
        };
    }

    formatText(text: string) {
        return text.replace(/_/g, ' ');
    }

    receivedPrintQOMObjectiveTableEvent(event: any) {
        console.log({ receivedPrintQOMObjectiveTableEvent: event });

        const { header, data, printQOMObjectiveTable } = event;
        this.parentPrintQom = {
            printQOMObjectiveTable: printQOMObjectiveTable,
            data: data,
            header: header,
        };
    }

    printDocumentQOM(header: string, data: any): void {
        console.log('printDocumentQOM');
        this.parentPrintQom = {
            printQOMObjectiveTable: true,
            data: data,
            header: header,
        };

        // this.printQOMObjectiveTableEvent.emit({
        //     printQOMObjectiveTable: true,
        //     data: data,
        //     header: header,
        // });
    }
}
