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
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileService } from 'src/app/demo/service/file.service';
import { Subject, pipe, takeUntil } from 'rxjs';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { AuthService } from 'src/app/demo/service/auth.service';
import { validateFileType } from 'src/app/utlis/file-utils';
@Component({
    selector: 'app-add-files',
    templateUrl: './add-files.component.html',
    styleUrl: './add-files.component.scss',
})
export class AddFilesComponent implements OnInit, OnDestroy {
    @Input() addNewFile: string;
    @Output() childAddFile = new EventEmitter<object>();

    private getAddFilesComponentSubscription = new Subject<void>();
    addFileTrigger: any;

    uploadedFiles: any[] = [];
    userID: string;
    USERID: string;
    frequencyFileName: string;
    objectiveIDforFile: any;
    AllObjectivesFiles: any[] = [];
    loading: boolean;
    addObjectiveFileDialogCard: boolean;
    public addFileForm: FormGroup;
    viewObjectiveFileDialogCard: boolean;

    constructor(
        private messageService: MessageService,
        private fileService: FileService,
        private formBuilder: FormBuilder,
        private auth: AuthService
    ) {
        this.USERID = this.auth.getTokenUserID();
    }

    ngOnChanges(changes: SimpleChanges) {
        const addFileTrigger = changes['addNewFile']?.currentValue;
        this.addFileTrigger = changes['addNewFile']?.currentValue;

        console.log(
            'changes addNewFile currentValue',
            changes['addNewFile']?.currentValue
        );

        if (addFileTrigger && addFileTrigger.addFile) {
            this.addObjectiveFileDialogCard = true;
            this.objectiveIDforFile = addFileTrigger?.objectiveId;
            this.frequencyFileName = addFileTrigger?.frequencyFileName;
        }
    }

    ngOnInit() {
        this.createaddFileForm();
    }

    ngOnDestroy() {
        this.getAddFilesComponentSubscription.next();
        this.getAddFilesComponentSubscription.complete();
    }

    createaddFileForm() {
        this.addFileForm = this.formBuilder.group({
            files: ['', [Validators.required]],
        });
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

        console.log('uploadedFiles', {
            user_id: this.USERID,
            objectiveId: this.objectiveIDforFile,
            files: this.uploadedFiles,
            frequencyFileName: this.frequencyFileName
                ? this.frequencyFileName
                : '',
        });

        this.fileService
            .addObjectiveFiles({
                user_id: this.USERID,
                objectiveId: this.objectiveIDforFile,
                files: this.uploadedFiles,
                frequencyFileName: this.frequencyFileName
                    ? this.frequencyFileName
                    : '',
            })
            .pipe(takeUntil(this.getAddFilesComponentSubscription))
            .subscribe({
                next: (data: any) => {
                    this.childAddFile.emit({
                        USERID: this.USERID,
                        objectiveId: this.objectiveIDforFile,
                        viewObjectiveFileDialogCard: false,
                        frequencyFileNameForUpdate: data.fileNames[0],
                        frequencyFileName: this.frequencyFileName,
                    });

                    console.log('childAddFiledata', {
                        USERID: this.USERID,
                        objectiveId: this.objectiveIDforFile,
                        viewObjectiveFileDialogCard: false,
                        frequencyFileNameForUpdate: data.fileNames[0],
                        frequencyFileName: this.frequencyFileName,
                    });

                    this.addObjectiveFileDialogCard = false;
                    this.AllObjectivesFiles = [];
                    if (data.success) {
                        this.messageService.add({
                            severity: 'success  ',
                            summary: 'View the files',
                            detail: 'Files added successfully',
                        });
                        this.addFileForm.reset();
                        this.uploadedFiles = [];
                        this.addObjectiveFileDialogCard = false;

                        // this.viewObjectiveFileDialogCard = false;
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: error.message,
                    });
                },
                complete: () => {},
            });
    }
}
