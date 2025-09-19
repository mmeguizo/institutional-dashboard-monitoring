import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
} from '@angular/core';
import { Subject, pipe, takeUntil } from 'rxjs';
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
import { CampusService } from 'src/app/demo/service/campus.service';
import { Role } from 'src/app/interface/role.interface';
import { PdfService } from 'src/app/demo/service/pdf.service';
import { Campus } from 'src/app/interface/campus-location.interface';
import { validateFileType, getIcon } from 'src/app/utlis/file-utils';

@Component({
    selector: 'app-goals',
    templateUrl: './goals.component.html',
    styleUrl: './goals.component.scss',
})
export class GoalsComponent implements OnInit, OnDestroy {
    private getGoalSubscription = new Subject<void>();
    @ViewChild('filter') filter!: ElementRef;

    userCampus: string;
    userDepartment: string;

    //table data
    goals: any[] = [];
    Alldepts: any[] = [];
    AllObjectivesFiles: any[] = [];
    AllObjectivesHistoryFiles: any[] = [];
    ViewBudget: any[] = [];
    deptDropdownCampusValue: any[] = [];

    //table columns
    cols!: any;
    loading = true;

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
    hideviewObjectiveFileDialogCardID: any;

    // progress bar
    value = 0;
    interval: any;
    goalDataRemainingBudget: number = 0;
    goalBudget: number = 0;
    // set initial value
    onclickCompletionButton = [];
    blockedPanel: boolean;
    subOnjectiveHeaderData: any;
    role: Role;
    tableData: any;
    toPrint: boolean = false;
    printable: any;
    isPrintableVisible: boolean = false;
    printingHead: boolean = false;
    nameValue: string = ''; // Declare variables to hold values
    officeValue: string = '';
    printingOfficeName: string = '';
    constructor(
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService,
        private goal: GoalService,
        private auth: AuthService,
        private obj: ObjectiveService,
        private dept: DepartmentService,
        private fileService: FileService,
        private fileUpload: FileUpload,
        private camp: CampusService,
        private changeDetectorRef: ChangeDetectorRef,
        private pdfService: PdfService
    ) {
        this.USERID = this.auth.getTokenUserID();
        this.role = this.auth.getUserRole() as Role;
        this.userCampus = this.auth.getUserCampus() as Campus;
        this.userDepartment = this.auth.getUserDepartment();
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

    getAllObjectivesWithObjectives() {
        this.goal
            .fetch(
                'get',
                'goals',
                'getAllObjectivesWithObjectives/' + this.USERID
            )
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                // this.ObjectivesGoals = data.goals;

                this.goals = data.goals;
                this.loading = false;
            });
    }
    getAllDept() {
        this.dept
            .getRoute('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.deptDropdownValue = data.data[0];
            });
    }

    async getObjectives(
        id: string,
        objectId: string = '',
        subHeader: string = '',
        goalDataRemainingBudget: number = 0,
        goalData: any = []
    ) {
        //passed data needed for the subgoal table or adding table modal
        this.subObjectiveGoalID = id;
        this.goal_ObjectId = objectId || goalData._id || '';
        //open the objective modal
        this.subGoalObjective = true;
        //remaining budget needed in adding objective input
        //headers in objective table

        this.subOnjectiveHeaderData = goalData;
        this.goalDataRemainingBudget =
            goalDataRemainingBudget ||
            this.subOnjectiveHeaderData?.remainingBudget;
        this.goalBudget = this.subOnjectiveHeaderData?.budget;

        this.subObjectiveHeaders = this.customTitleCase(
            subHeader || this.subObjectiveHeaders || ''
        );

        //get all goals with subobjective
        if (id) {
            this.loading = true;
            this.obj
                .fetch('get', 'objectives', `getAllByIdObjectives/${id}`)
                .pipe(takeUntil(this.getGoalSubscription))
                .subscribe((data: any) => {
                    this.objectiveDatas = data.Objectives;
                    //initialize completion button
                    for (
                        let i = 0;
                        i < this.objectiveDatas.length.length;
                        i++
                    ) {
                        this.onclickCompletionButton[i] = false;
                    }

                    this.loading = false;
                });
        }
    }
    async getObjectivesReload(id: string) {
        //get all goals with subobjective
        if (id) {
            this.loading = true;
            this.obj
                .fetch(
                    'get',
                    'objectives',
                    `getAllByIdObjectives/${id}/${this.USERID}`
                )
                .pipe(takeUntil(this.getGoalSubscription))
                .subscribe((data: any) => {
                    this.objectiveDatas = data.Objectives;
                    let subBudget = data.Objectives.reduce((acc, e) => {
                        return acc + e.budget;
                    }, 0);

                    this.goalDataRemainingBudget = this.goalBudget - subBudget;
                    this.changeDetectorRef.detectChanges();
                    //initialize completion button
                    for (
                        let i = 0;
                        i < this.objectiveDatas.length.length;
                        i++
                    ) {
                        this.onclickCompletionButton[i] = false;
                    }

                    this.loading = false;
                });
        }
    }

    async getAllFilesFromObjectiveLoad(
        id: string,
        objectiveID: string
    ): Promise<Boolean> {
        this.loading = true;
        this.fileService
            .getAllFilesFromObjective(id, objectiveID)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.AllObjectivesFiles = data.data;
                this.loading = false;
            });
        return true;
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
                this.loading = false;
            });
        return true;
    }

    addSubGoal(data?: any) {
        this.addObjectiveGoalDialogCard = true;
    }

    addGoal() {
        this.addGoalDialogCard = true;
    }

    addFiles(objectiveData: any) {
        // alert(objectiveID);
        this.addObjectiveFileDialogCard = true;
        // alert(JSON.stringify(objectiveData));
    }

    addGoalDialogExec(form: any) {
        this.userID = this.USERID;

        let data = {
            goals: form.value.goals,
            budget: form.value.budget,
            campus: this.userCampus,
            department: this.userDepartment,
            createdBy: this.userID,
        };

        this.goal
            .fetch('post', 'goals', 'addGoals', data)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getAllObjectivesWithObjectives();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.addGoalDialogCard = false;
                    this.addGoalform.reset();
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    addSubObjectiveGoalDialogExec(e: any) {
        e.value.userId = this.USERID;
        e.value.goalId = this.subObjectiveGoalID;
        e.value.goal_Id = this.goal_ObjectId;
        e.value.frequency_monitoring =
            this.formGroupDropdown.value.selectedDropdown.name;
        e.value.createdBy = this.USERID;
        this.obj
            .fetch('post', 'objectives', 'addObjectives', e.value)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.addObjectiveGoalDialogCard = false;
                    //close the objective table
                    // this.subGoalObjective = false;
                    this.getAllObjectivesWithObjectives();
                    this.getObjectivesReload(this.subObjectiveGoalID);
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    //fix the error becomes null after adding new objective
                    this.goal_ObjectId = data.data.goal_Id;
                    // clear the data
                    this.addObjectiveGoalform.reset();
                    this.formGroupDropdown.reset();
                    this.goalDataRemainingBudget = 0;
                } else {
                    this.messageService.add({
                        severity: 'warn  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    updateGoalDialogExec(form: any) {
        let data = {
            id: this.updateGoalID,
            goals: form.value.goals,
            budget: form.value.budget,
            department: this.userDepartment,
            campus: this.userCampus,
        };
        this.goal
            .fetch('put', 'goals', 'updateGoals', data)
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
    }

    updateGoal(goal) {
        this.updateGoalDialogCard = true;
        this.updateGoalID = goal.id;
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
            goals: [goal.goals || '', [Validators.required]],
            budget: [goal.budget || 0, [Validators.required]],
        });
    }

    updateSubGoal(data: any) {
        this.tobeUpdatedSubGoal = data.id;
        //reset every after click
        this.addObjectiveGoalform.reset();
        // this.formGroupDropdown.reset();

        this.updateObjectiveGoalFlag = true;
        this.addObjectiveGoalDialogCard = true;
        this.formGroupDropdown.setValue({
            selectedDropdown: this.dropdwonSelection.find(
                (dept) => dept.name === data.frequency_monitoring
            ) || { name: 'daily', code: 'Daily' },
        });

        this.addObjectiveGoalform.patchValue({
            // department: ['', [Validators.required]],
            userId: data.userId,
            goalId: data.goalId,
            functional_objective: data.functional_objective,
            performance_indicator: data.performance_indicator,
            target: data.target,
            formula: data.formula,
            programs: data.programs,
            responsible_persons: data.responsible_persons,
            clients: data.clients,
            timetable: [
                new Date(data.timetable[0]),
                new Date(data.timetable[1]),
            ],
            frequency_monitoring: data.frequency_monitoring,
            data_source: data.data_source,
            budget: data.budget,
        });
    }

    updateObjectiveComplete(
        event: Event,
        data: any,
        index = 0,
        completeStatus: any
    ) {
        this.onclickCompletionButton[index] = true;
        let goalIDs = data.goalId;

        if (completeStatus === true && this.role === 'user') {
            this.messageService.add({
                severity: 'error  ',
                summary: 'Nice Try!!!',
                detail: 'Only Admin can enable this..',
            });
            this.onclickCompletionButton[index] = false;
            return;
        }

        this.confirmationService.confirm({
            key: 'updateObjectiveComplete',
            target: event.target as EventTarget,
            message: `Marking Objective ${
                completeStatus
                    ? 'as Incomplete'
                    : ' as Complete? Will Lock Files only Admin can re enable'
            }`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'none',
            rejectIcon: 'none',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.obj
                    .fetch('put', 'objectives', 'updateobjectivecompletion', {
                        id: data.id,
                    })
                    .pipe(takeUntil(this.getGoalSubscription))
                    .subscribe(async (results: any) => {
                        if (results.success) {
                            this.getAllObjectivesWithObjectives();
                            // this.getObjectives(goalIDs);
                            this.getObjectivesReload(goalIDs);
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: results.message,
                                life: 5000,
                            });
                            // this saves the objectid instead of refetch by closing the dialog it will run hideview to refetch
                            this.hideviewObjectiveFileDialogCardID = goalIDs;
                            // this.hideviewObjectiveFileDialogCard(goalIDs);
                        } else {
                            this.messageService.add({
                                severity: 'error  ',
                                summary: 'Error',
                                detail: results.message,
                            });
                        }
                    });
                // this.onclickCompletionButton = false;
                this.onclickCompletionButton[index] = false;
            },
            reject: () => {
                this.onclickCompletionButton[index] = false;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Done',
                    detail: 'Nothing happens',
                    life: 3000,
                });
            },
        });
    }

    updateSubObjectiveGoalDialogExec(form: any) {
        form.value.id = this.tobeUpdatedSubGoal;
        form.value.frequency_monitoring =
            this.formGroupDropdown.value.selectedDropdown.name;
        this.obj
            .fetch('put', 'objectives', 'updateObjectives', form.value)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    //close the objective table
                    this.addObjectiveGoalDialogCard = false;
                    // this.subGoalObjective = false;
                    this.getAllObjectivesWithObjectives();
                    this.getObjectivesReload(this.subObjectiveGoalID);
                    this.addObjectiveGoalDialogCard = false;
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
                            this.getObjectives(goalId);
                            this.loading = false;
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

    deleteSubGoalFile(id: string, source: string) {
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

        // alert(JSON.stringify(objectiveData));
        this.getAllFilesFromObjectiveLoad(this.USERID, objectiveData.id);
    }

    viewFilesHistory(objectiveData: any) {
        this.viewObjectiveFileHistoryDialogCard = true;
        this.getAllFilesHistoryFromObjectiveLoad(this.USERID, objectiveData.id);
    }

    onUpload(event: any) {
        for (const file of event.files) {
            this.uploadedFiles.push(file);
        }

        if (!validateFileType(this.uploadedFiles)) {
            this.messageService.add({
                severity: 'error',
                summary: 'File Unsupported',
                detail: 'Unsupported file type! Please select only images, documents, or spreadsheets',
            });
            event.preventDefault();
        }

        this.fileService
            .addMultipleFiles(
                this.USERID,
                this.objectiveIDforFile,
                this.uploadedFiles
            )
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                // after adding files it did not add the new files just reload, clear the data to fix the issue
                this.AllObjectivesFiles = [];
                this.getAllFilesFromObjectiveLoad(
                    this.USERID,
                    this.objectiveIDforFile
                );
                if (data.success) {
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'View the files',
                        detail: 'Files added successfully',
                    });
                    this.addObjectiveFileDialogCard = false;
                    this.addFileForm.reset();
                    this.uploadedFiles = [];
                    this.viewObjectiveFileDialogCard = false;
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    clearAddObjectiveGoalDialogCardDatas() {
        this.addObjectiveGoalDialogCard = false;
        this.updateObjectiveGoalFlag = false;
        this.tobeUpdatedSubGoal = null;
        this.addObjectiveGoalform.reset();
    }

    hidviewObjectRefetch(id) {
        this.obj
            .fetch('get', 'objectives', `getAllByIdObjectives/${id}`)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.objectiveDatas = data.Objectives;
                // remove the data
                this.hideviewObjectiveFileDialogCardID = null;
                this.loading = false;
            });
    }

    hideViewObjectiveTable(id?: string) {
        this.subGoalObjective = false;
        this.subObjectiveGoalID = null;
        this.objectiveDatas = [];
        //after they click the switch it and close the dialog will refetch
        if (id) {
            this.hidviewObjectRefetch(id);
        }
    }

    hideViewFileDialogCard() {
        // destroy the data needed on that dialog
        this.objectiveIDforFile = null;
        this.viewObjectiveFileDialogCard = false;
    }
    hideViewFileHistoryDialogCard() {
        this.viewObjectiveFileHistoryDialogCard = false;
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

    printTableNeeds(header?) {
        this.printingHead = true;
        this.printingOfficeName = header;
    }

    printTable(subOnjectiveHeaderData: any = '', name?: any, office?: any) {
        let imageSrc = this.auth.domain + '/images/logo.png';
        this.isPrintableVisible = true;
        let print, win;
        print = document.getElementById('print').innerHTML;
        win = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        win.document.open();
        win.document.write(`
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Document</title>
            </head>
            <style>
            * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
          }

          body {
            width: 11in;
            height: 8.5in;
          }

          @media print {
            body {
              padding: unset;
              width: unset;
              height: unset;
              -webkit-print-color-adjust: exact; /* Enable background graphics */
              print-color-adjust: exact; /* Enable background graphics */
            }
            @page {
              size: landscape; /* Set layout to landscape */
            }
            margin: 1.5in 0in 0in 0in;
          }

          table {
            border-collapse: collapse;
            width: 100%;
          }

          table:not(:is(.nested-table)) {
            border-top: 1px solid;
            border-left: 1px solid;
            table-layout: fixed;
          }

          table :is(th, td) {
            padding: 4px 6px;
            border-right: 1px solid;
            border-bottom: 1px solid;
          }

          .nested-table {
            tr {
              td {
                font-weight: 600;
                &[rowspan="4"] {
                  border-bottom: 0;
                }
                &:last-child {
                  border-right: 0;
                }
              }
              &:last-child {
                td {
                  &:last-child {
                    border-bottom: 0;
                  }
                }
              }
            }
          }

          .logo {
            border-right: 0;
            img {
              width: 80px;
              height: 80px;
              margin-left: auto;
              display: block;
            }
            & + td {
              & > div {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                > h1 {
                  font-size: 26px;
                }
                > h5 {
                  color: #064f7c;
                }
                > hr {
                  margin-top: 8px;
                  width: 80%;
                  border: 1px solid;
                }
              }
            }
          }

          tr.font-condensed {
            & > th {
              font-size: 18px;
              padding: 8px 6px;
              &:first-child {
                background-color: #f57e3a;
              }
              &:nth-child(2) {
                background-color: #057a40;
              }
              &:last-child {
                background-color: #efdf10;
              }
            }
            & + tr {
              & > th {
                padding: 8px;
              }
              & + tr {
                & > th {
                  padding: 0px 4px;
                  font-stretch: condensed;
                  font-size: 16px;
                }
                & + tr {
                  & > th {
                    padding: 2px;
                  }
                }
              }
            }
          }

          tbody.data-cells {
            font-stretch: condensed;
            & tr {
              & > td {
                height: 0;
                & > div {
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  gap: 1rem;
                  justify-content: space-evenly;
                  text-align: center;
                  & p {
                    font-size: 14px;
                  }
                }
              }
            }
          }

          tfoot {
            font-stretch: condensed;
            & tr td {
              padding: 0;
              & > div {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                & > div {
                  &:not(:last-child) {
                    border-right: 1px solid;
                  }
                  & > div {
                    font-size: 14px;
                    padding: 3px 6px;
                    &:not(:last-child) {
                      border-bottom: 1px solid;
                    }
                    &:nth-child(2) {
                      text-align: center;
                      font-size: 16px;
                      padding-top: 32px;
                      font-weight: 600;
                      padding-bottom: 0px;
                    }
                    &:last-child {
                      text-align: center;
                      font-size: 14px;
                    }
                  }
                }
              }
            }
          }

          .border-0 {
            /* border: 0px; */
          }

          .p-0 {
            padding: 0px;
          }

          .text-align-end {
            text-align: end;
          }

          .border-x-0 {
            border-left: 1px solid white;
            border-right: 1px solid white;
          }

          .font-condensed {
            font-stretch: condensed;
          }

            </style>
            <body>
              <div id="tobeprinted">
                <table>
                  <thead>
                    <tr>
                      <th class="p-0" rowspan="4" colspan="10">
                        <table class="nested-table">
                          <tr>
                            <td rowspan="4" class="logo">
                              <img src="${imageSrc}" alt="CHMSU Logo" />
                            </td>
                            <td rowspan="4">
                              <div>
                                <h1>Carlos Hilado Memorial State University</h1>
                                <h5>Alijis Campus . Binalbagan Campus . Fortune Towne Campus . Talisay Campus</h5>
                                <hr />
                              </div>
                            </td>
                            <td>Revision No.</td>
                          </tr>
                          <tr>
                            <td>Date of Revision</td>
                          </tr>
                          <tr>
                            <td>Date of Effectivity</td>
                          </tr>
                          <tr>
                            <td>Page No.</td>
                          </tr>
                        </table>
                      </th>
                      <th>&nbsp;</th>
                    </tr>
                    <tr>
                      <th>&nbsp;</th>
                    </tr>
                    <tr>
                      <th>&nbsp;</th>
                    </tr>
                    <tr>
                      <th class="text-align-end">Page 2</th>
                    </tr>
                    <tr class="font-condensed">
                    <th colspan="5">${
                        subOnjectiveHeaderData.toUpperCase() ||
                        this.printingOfficeName.toUpperCase()
                    }</th>
                      <th colspan="5">QUALITY OBJECTIVES AND ACTION PLAN</th>
                      <th class="text-align-end">CY</th>
                    </tr>
                    <tr>
                      <th class="border-x-0" colspan="11"></th>
                    </tr>
                    <tr>
                      <th class="border-x-0" colspan="11"></th>
                    </tr>
                  </thead>
                  <body onload="window.print();window.close()">${print}</body>
                  <tfoot>
                    <tr>
                      <td colspan="11">
                        <div>
                          <div>
                            <div>Prepared by:</div>
                            <div>${this.nameValue.toLocaleUpperCase()}</div>
                            <div>${this.officeValue.toLocaleUpperCase()}</div>
                          </div>
                          <div>
                            <div>Reviewed and verified by:</div>
                            <div>YRIKA MARIE R. DUSARAN, PhDTM</div>
                            <div>Director for Quality Management</div>
                          </div>
                          <div>
                            <div>Approved by:</div>
                            <div>ROSALINDA S. TUVILLA</div>
                            <div>Vice President for Administrator and Finance</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </body>
          </html>
              `);
        win.document.close();
        this.isPrintableVisible = false;
        this.printingOfficeName = '';
        this.nameValue = '';
        this.officeValue = '';
    }
}
