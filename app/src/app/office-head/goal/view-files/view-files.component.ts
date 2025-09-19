import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    SimpleChanges,
} from '@angular/core';
import { AuthService } from 'src/app/demo/service/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

import { FileService } from 'src/app/demo/service/file.service';
import { getFrequencyKeys, getIcon } from 'src/app/utlis/file-utils';

@Component({
    selector: 'app-view-files',
    templateUrl: './view-files.component.html',
    styleUrl: './view-files.component.scss',
})
export class ViewFilesComponent implements OnInit, OnDestroy {
    @Input() viewFiles: string;
    private viewFilesSubscription = new Subject<void>();

    viewObjectiveFileDialogCard: Boolean = false;
    AllObjectivesFiles: any[] = [];
    loading: boolean = false;
    viewFilesTrigger: any;
    objectiveIDforFile: any;
    USERID: string;

    constructor(
        private messageService: MessageService,
        private auth: AuthService,
        private file: FileService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['viewFiles']?.currentValue) {
            const { data, viewFiles } = changes['viewFiles']?.currentValue;
            this.objectiveIDforFile = data.id;
            //use this when triggering the child component for adding file
            this.getAllFilesFromObjectiveLoad(this.USERID, data.id);
            this.viewObjectiveFileDialogCard = viewFiles;
        }
    }

    ngOnInit() {
        this.USERID = this.auth.getTokenUserID();
    }
    ngOnDestroy(): void {}

    hideViewFileDialogCard() {
        this.viewObjectiveFileDialogCard = false;
    }

    async getAllFilesFromObjectiveLoad(
        id: string,
        objectiveID: string
    ): Promise<boolean> {
        try {
            this.loading = true;
            this.file
                .getAllFilesFromObjective(id, objectiveID)
                .pipe(takeUntil(this.viewFilesSubscription))
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

    getFrequencyKeys(objectiveFile: any) {
        return getFrequencyKeys(objectiveFile);
    }

    getIcon(name: string) {
        return getIcon(name);
    }

    // delete file
    deleteSubGoalFile(id: string, source: string) {
        // alert(`delete sub goal file ${id} ${source}`);
        this.confirmationService.confirm({
            key: 'deleteSubGoalFile',
            target: event.target || new EventTarget(),
            message: 'Delete File',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.file
                    .deleteFileObjective({
                        id: id,
                        source: source,
                    })
                    .pipe(takeUntil(this.viewFilesSubscription))
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
}
