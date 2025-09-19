import {
    Component,
    Input,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    ChangeDetectorRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { GoalService } from 'src/app/demo/service/goal.service';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-goal-table',
    templateUrl: './goal-table.component.html',
    styleUrl: './goal-table.component.scss',
})
export class GoalTableComponent implements OnDestroy, OnChanges {
    @Input() goals: any[] = [];
    @Input() newGoalDataFromParent: any;
    @Output() editGoalName = new EventEmitter<{ id: string }>();
    filteredGoals: any[] = [];
    loading: boolean = false;
    position: string = 'top';

    private goalTableSubscription = new Subject<void>();

    // expanded table var
    expandedRows: expandedRows = {};
    isExpanded: boolean = false;

    constructor(
        private goalService: GoalService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdRef: ChangeDetectorRef
    ) {
        //get all goalists
        this.getAllGoalLists();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (
            changes['newGoalDataFromParent'] &&
            changes['newGoalDataFromParent'].currentValue
        ) {
            this.loading = true;
            const newGoal = changes['newGoalDataFromParent'].currentValue;
            // Check if newGoal.data exists and is an object
            if (newGoal.data && typeof newGoal.data === 'object') {
                const existingGoalIndex = this.goals.findIndex(
                    (goal) => goal.id === newGoal.data.id
                );

                if (existingGoalIndex !== -1) {
                    // Update existing goal
                    this.goals[existingGoalIndex] = newGoal.data;
                } else {
                    // Add new goal
                    this.goals.unshift(newGoal.data);
                }
                this.cdRef.detectChanges();
                this.loading = false;
            } else {
                console.error('Invalid newGoalDataFromParent format:', newGoal);
                // Handle the error appropriately
            }
        }
    }

    getAllGoalLists(data?: any) {
        if (data) {
            this.goals = data;
            this.loading = false;
            return; // Stop execution if data is truthy
        }
        this.loading = true;
        this.goalService
            .fetch('get', 'goallists', 'getAllGoalLists')
            .pipe(takeUntil(this.goalTableSubscription))
            .subscribe({
                next: (data: any) => {
                    this.goals = data.data[0] || [];
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error fetching data:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to Fetch goal',
                    }); // Display error message
                },
            });
    }

    updateGoal(object: any) {
        this.editGoalName.emit(object);
    }

    deleteGoal(id: string) {
        this.filteredGoals = this.goals.filter((goal) => goal.id !== id);
        setTimeout(() => {
            this.confirmationService.confirm({
                message: 'Are you sure you want to proceed?',
                header: 'Delete',
                icon: 'pi pi-info-circle',
                acceptIcon: 'none',
                rejectIcon: 'none',
                rejectButtonStyleClass: 'p-button-text',
                accept: () => {
                    this.loading = true;
                    this.goalService
                        .fetch('put', 'goallists', 'deleteGoalLists', {
                            id: id,
                        })
                        .pipe(takeUntil(this.goalTableSubscription))
                        .subscribe({
                            next: (data: any) => {
                                if (data.success) {
                                    // this.goals = this.filteredGoals;
                                    this.messageService.add({
                                        severity: 'info',
                                        summary: 'Confirmed',
                                        detail: 'Delete submitted',
                                    });

                                    this.getAllGoalLists(this.filteredGoals);
                                }
                            },
                            error: (error) => {
                                console.error('Error fetching data:', error);
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail: 'Failed to Delete goal',
                                }); // Display error message
                            },
                        });
                },
                reject: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Rejected',
                        detail: 'Process incomplete',
                        life: 3000,
                    });
                },
                key: 'positionDialog',
            });
        }, 0);
    }

    expandAll() {
        if (!this.isExpanded) {
            this.goals.forEach((goal) =>
                goal.goals ? (this.expandedRows[goal.goals] = true) : ''
            );
        } else {
            this.expandedRows = {};
        }
        this.isExpanded = !this.isExpanded;
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.goalTableSubscription.next();
        this.goalTableSubscription.complete();
    }
}
