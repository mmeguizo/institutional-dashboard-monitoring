import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
    EventEmitter,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GoalService } from 'src/app/demo/service/goal.service';
import { Subject, pipe, takeUntil } from 'rxjs';
@Component({
    selector: 'app-goal',
    templateUrl: './goal.component.html',
    styleUrl: './goal.component.scss',
})
export class GoalComponent implements OnInit, OnDestroy {
    private deleteGoalSubscription = new Subject<void>();
    //add goal
    parentAddnewGoal: object = {};
    parentEmitAddnewGoal: object = {};

    //edit goal
    parentEditGoal: object = {};
    parentEmitEditGoal: object = {};

    //delete goal
    parentEmitDeleteGoal: object = {};
    parentDeleteGoal: object = {};

    //get objective
    parentGetObjective: object = {};
    parentEmitGetObjective: object = {};

    // add objective
    parentAddnewObjective: object = {};
    parentEmitAddObjective: object = {};

    ConfirmationService;
    parentEmitSuccessAddObjective: {
        addedNewObjective: boolean;
        success: boolean;
        data: any;
    };
    parentEditObjective: { editObjective: any; data: any };
    parentEditSuccessObjective: { success: Boolean; id: string };
    parentAddnewFile: any;
    parentRemarks: any;
    parentViewFiles: { viewFiles: any; data: any };
    parentPrintFile: any = {};
    parentPrintQom: any = {};
    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private goal: GoalService
    ) {}

    ngOnInit() {}

    ngOnDestroy(): void {
        this.deleteGoalSubscription.next();
        this.deleteGoalSubscription.complete();
    }
    receivedAddGoalEvent(event: any) {
        if (event?.success) {
            this.parentEmitAddnewGoal = {
                addedNewGoal: true,
                userId: event.userId,
            };
        }
    }

    receivedAddNewGoalButtonClick(event: any) {
        this.parentAddnewGoal = { addGoal: event.addNewGoal };
    }

    receivedEditGoalEvent(event: any) {
        if (event?.success) {
            this.parentEmitEditGoal = {
                editedAGoal: true,
                goal: event.data,
            };
        }
    }

    receivedPrintObjectiveTableEvent(event: any) {
        const { header, data, printObjectiveTable } = event;
        this.parentPrintFile = {
            printObjectiveTable: printObjectiveTable,
            data: data,
            header: header,
        };
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

    receivedEditGoalButtonClick(event: any) {
        this.parentEditGoal = {
            editGoal: event.editGoal,
            goal: event.goal,
        };
    }

    receivedGetObjectiveButtonClick(event: any) {
        const {
            id: id,
            _id: _id,
            listsId: listsId,
            goal: goal,
            remainingBudget: remainingBudget,
            goalData: goalData,
        } = event;
        this.parentGetObjective = {
            getObjective: true,
            id: id,
            _id: _id,
            listsId: listsId,
            goal: goal,
            remainingBudget: remainingBudget,
            goalData: goalData,
        };
    }

    receivedGetObjectiveEvent(event: any) {
        // this.parentEmitGetObjective = {
        //     getObjective: true,
        // };
    }

    // add objective
    receivedAddObjectiveEvent(event: any) {
        const { addObjective, goallistsId, goalId, goal_ObjectId, data } =
            event;
        if (event?.addObjective) {
            this.parentEmitAddObjective = {
                addedNewObjective: true,
                addObjective,
                goallistsId,
                goalId,
                goal_ObjectId,
                data,
            };
        }
    }

    receivedAddSuccessObjectiveEvent(event: any) {
        const { addedNewObjective, success, data } = event;
        if (success) {
            this.parentEmitSuccessAddObjective = {
                addedNewObjective,
                success,
                data,
            };
        }
    }

    receivedEditObjectiveEvent(event: any) {
        const { editObjective, data } = event;
        this.parentEditObjective = {
            editObjective: editObjective,
            data: data,
        };
    }

    receivedUpdateObjective(event: any) {
        const { success, id: goalID } = event;
        if (success) {
            this.parentEditSuccessObjective = {
                success: success,
                id: goalID,
            };
        }
    }

    receivedAddFileEvent(event: any) {
        const {
            USERID,
            objectiveId,
            viewObjectiveFileDialogCard,
            frequencyFileNameForUpdate,
            frequencyFileName,
        } = event;
    }

    receivedViewFilesButtonClick(event: any) {
        const { viewFiles, data } = event;
        this.parentViewFiles = {
            viewFiles: viewFiles,
            data: data,
        };
    }

    receivedRemarksEvent(event: any) {
        const { remarksDialogCard, data } = event;
        this.parentRemarks = {
            remarksDialogCard: remarksDialogCard,
            data: data,
        };
    }
}
