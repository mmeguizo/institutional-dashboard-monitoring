import {
    Component,
    OnInit,
    OnDestroy,
    EventEmitter,
    SimpleChanges,
    Input,
    Output,
} from '@angular/core';
import { Subject, pipe, takeUntil, tap, catchError, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GoalService } from 'src/app/demo/service/goal.service';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
    selector: 'app-goal-table',
    templateUrl: './goal-table.component.html',
    styleUrl: './goal-table.component.scss',
})
export class GoalTableComponent implements OnInit, OnDestroy {
    private getGoalTableSubscription = new Subject<void>();
    @Input() editObjective = new EventEmitter<any>();
    @Input() addedaGoal = new EventEmitter<any>();
    @Input() editedAGoal = new EventEmitter<any>();
    @Input() deletedAGoal = new EventEmitter<any>();
    @Output() addNewGoalButtonClick = new EventEmitter<any>();
    @Output() editGoalButtonClick = new EventEmitter<any>();
    @Output() deleteGoalButtonClick = new EventEmitter<any>();
    @Output() getObjectiveButtonClick = new EventEmitter<any>();

    goals: any[] = [];
    loading: boolean = false;
    USERID: string;
    addGoalTrigger: any;
    editGoalTrigger: any;
    deleteGoalTrigger: any;
    editObjectiveTrigger: any;

    constructor(
        private goal: GoalService,
        private messageService: MessageService,
        private auth: AuthService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        this.editObjectiveTrigger = changes['editObjective']?.currentValue;
        this.addGoalTrigger = changes['addedaGoal']?.currentValue;
        this.editGoalTrigger = changes['editedAGoal']?.currentValue;
        this.deleteGoalTrigger = changes['deletedAGoal']?.currentValue;
        if (this.addGoalTrigger && this.addGoalTrigger.addedNewGoal) {
            this.goalsTableData(this.addGoalTrigger.userId);
        }
        if (this.editGoalTrigger && this.editGoalTrigger.editedAGoal) {
            this.goalsTableData(this.USERID);
        }
        if (this.deleteGoalTrigger && this.deleteGoalTrigger.deleteAGoal) {
            this.goalsTableData(this.USERID);
        }
        if (this.editObjectiveTrigger && this.editObjectiveTrigger.success) {
            this.goalsTableData(this.USERID);
        }
    }

    ngOnInit() {
        this.loading = true;
        this.USERID = this.auth.getTokenUserID();
        this.goalsTableData(this.USERID);
    }

    ngOnDestroy() {
        this.getGoalTableSubscription.unsubscribe();
    }

    goalsTableData(userId?: string) {
        const resultSubject = new Subject<boolean>();
        this.loading;
        this.goal
            .fetch(
                'get',
                'office_head_query',
                `getAllObjectivesWithObjectivesTableOfficeHead/${userId}`
            )
            .pipe(
                takeUntil(this.getGoalTableSubscription),
                tap((data: any) => {
                    this.goals = data.goals;
                    this.loading = false;
                    resultSubject.next(true); // Emit true on success
                    resultSubject.complete(); // Complete the subject
                }),
                catchError((error) => {
                    this.loading = false; // Set loading to false on error
                    this.messageService.add({
                        severity: 'error',
                        summary:
                            'Error getAllObjectivesWithObjectivesTableOfficeHead',
                        detail: error.message,
                    });
                    resultSubject.next(false); // Emit false on error
                    resultSubject.complete(); // Complete the subject
                    return throwError(() => error); // Re-throw the error if necessary
                })
            )
            .subscribe(); // Trigger the observable
        return resultSubject;
    }

    addGoal() {
        this.addNewGoalButtonClick.emit({
            addNewGoal: true,
        }); // Emit the event with the new goal
    }

    updateGoal(goal) {
        this.editGoalButtonClick.emit({
            editGoal: true,
            goal: goal,
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
                    .pipe(takeUntil(this.getGoalTableSubscription))
                    .subscribe((data: any) => {
                        if (data.success) {
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: data.message,
                            });
                            this.goalsTableData(this.USERID);
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

    getObjectives(
        id: string,
        _id: string,
        listsId: any,
        goal: any,
        // remainingBudget: any,
        goalData: any
    ) {
        this.getObjectiveButtonClick.emit({
            id: id,
            _id: _id,
            listsId: listsId,
            goal: goal,
            // remainingBudget: remainingBudget,
            goalData: goalData,
        });
    }
}
