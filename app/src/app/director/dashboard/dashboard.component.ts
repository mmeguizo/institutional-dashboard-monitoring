import {
    Component,
    signal,
    ChangeDetectorRef,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
    CalendarOptions,
    DateSelectArg,
    EventClickArg,
    EventApi,
} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth.service';
import { CardModule } from 'primeng/card';
import { UserService } from 'src/app/demo/service/user.service';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import {
    IcampusDropdown,
    IdepartmentDashboardDropdown,
} from 'src/app/interface/campus.interface';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { IdepartmentDropdown } from 'src/app/interface/department.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { abbreviateNumber } from 'src/app/utlis/general-utils';
import { customTitleCase } from 'src/app/utlis/custom-title-case';
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        RouterOutlet,
        FullCalendarModule,
        CommonModule,
        CardModule,
        RouterOutlet,
        FullCalendarModule,
        SkeletonModule,
        ChartModule,
        DropdownModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
    COLORS = ['#f06292', '#ba68c8', '#4dd0e1', '#aed581', '#ffca28'];
    calendarVisible = signal(true);
    private objectiveSubscription = new Subject<void>();

    currentEvents = signal<EventApi[]>([]);
    loading = true;
    userId: string;
    selectedBarDepartmentDropdown: IdepartmentDropdown | undefined;
    getAllObjectivesUnderADirectorData: any;
    goalBarChartList: IdepartmentDashboardDropdown[] | undefined;
    PieChartOptions: any;
    pieData: any;
    pieDataBool: Boolean = false;
    pieOptions: any;
    objectivesSideData: any[];
    selectedGoalData: any;

    totalBudget: number = 0;
    totalSubBudget: number = 0;
    remainingBudget: number = 0;
    completionPercentage: number = 0;
    completedGoals: number = 0;
    inProgressGoals: number = 0;
    totalObjectivesCount: number;
    knobValue: number;
    barChartType: string = 'line';
    options: any;
    barCharts: any;
    pieCharts: any;
    completedGoalsFromApi: any;
    uncompletedGoalsFromApi: any;
    goals: any;
    pieChartsBudgetUsed: any;
    PieChartBudgetUsedOptions: any;
    constructor(
        private changeDetector: ChangeDetectorRef,
        private obj: ObjectiveService,
        private auth: AuthService,
        public userService: UserService
    ) {}

    ngOnInit() {
        this.userId = this.auth.getTokenUserID();
        this.userId = this.auth.getTokenUserID();
        this.getAllObjectivesUnderADirector();
        // this.getAllusersUnderDirectors();
    }

    async onChangeDepartment(event: any = '') {
        this.barCharts = [];
        if (event.value) {
            const matchingGoals = this.goals.filter(
                (goal) => goal.department === event.value.name
            );
            this.barChartType = 'bar';
            await this.selectedBarChartDepartments(matchingGoals);
        }
    }

    async getAllObjectivesUnderADirector() {
        await this.userService
            .fetch(
                'get',
                'director_query',
                `getAllObjectivesUnderADirectorV2/${this.userId}`
            )
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                console.log({ getAllObjectivesUnderADirector: data });

                this.getAllObjectivesUnderADirectorData = data;
                this.completedGoalsFromApi = data.completedGoals;
                this.uncompletedGoalsFromApi = data.uncompletedGoals;
                this.goals = data.goals || [];
                this.goalBarChartList = data.dropdown || [];
                this.pieChart(data.goals || this.goals || []);
                this.thisBarCharts(data.goals);
                this.processDashboardData(data);
            });
    }

    async processDashboardData(data) {
        // total of objectives

        const objectives =
            data.goals?.reduce(
                (sum, goal) => sum + (goal.objectivesDetails?.length || 0),
                0
            ) || 0;

        this.totalBudget =
            data.goals?.reduce((sum, goal) => sum + (goal.budget || 0), 0) || 0;

        this.totalSubBudget = (data.goals ?? []).reduce((sum, goal) => {
            return (
                sum +
                (goal.objectivesDetails?.reduce(
                    (subSum, obj) => subSum + (obj.budget || 0),
                    0
                ) ?? 0)
            );
        }, 0);

        // Calculate remaining budget
        this.knobValue = this.remainingBudget =
            this.totalBudget - (this.totalSubBudget || 0);

        // Filter goals with objectives
        const goalsWithObjectives = (data.goals ?? []).filter(
            (goal) => goal.objectivesDetails?.length > 0
        );

        // Calculate completed, in-progress, and not-started goals
        const { completedGoals, inProgressGoals } = goalsWithObjectives.reduce(
            (acc, goal) => {
                const objectives = goal.objectivesDetails || [];

                objectives.forEach((obj) => {
                    if (obj.complete) {
                        acc.completedGoals++;
                    } else {
                        acc.inProgressGoals++;
                    }
                });

                return acc;
            },
            { completedGoals: 0, inProgressGoals: 0 }
        );

        // Assign calculated values
        this.completedGoals = completedGoals;
        this.inProgressGoals = inProgressGoals;

        // Calculate totalObjectivesCount by subtracting completed and in-progress goals and no negative values
        this.totalObjectivesCount = Math.abs(
            this.completedGoals + this.inProgressGoals
        );

        // Correctly calculate completion percentage
        this.completionPercentage =
            goalsWithObjectives.length > 0
                ? (this.completedGoals / goalsWithObjectives.length) * 100
                : 0;
    }

    async pieChart(data: any = []) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        const labels = data.map((goal) => goal.department);
        const budgets = data.map((goal) => goal.budgetMinusAllObjectiveBudget);
        const budgetsUsed = data.map(
            (goal: any) => goal.budgetMinusAllObjectiveBudget
        );
        const budgetsRemaining = data.map((goal: any) => goal.remainingBudget);

        const percentageCompletion = data.map(
            (goal: any) => goal.completion_percentage
        );
        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgba(${r}, ${g}, ${b}, 0.2)`;
        };

        const backgroundColors = labels.map(() => generateRandomColor());
        const hoverBackgroundColors = backgroundColors.map((color) =>
            color.replace('0.2', '0.4')
        );

        this.pieCharts = data = {
            labels: labels,
            datasets: [
                {
                    data: budgets,
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--green-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--yellow-400'),
                        documentStyle.getPropertyValue('--green-400'),
                    ],
                },
            ],
        };

        this.PieChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                    },
                },
                datalabels: {
                    formatter: (value: number) => abbreviateNumber(value),
                    color: textColor,
                    font: {
                        size: 15,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const label =
                                context.label
                                    .split(' ')
                                    .map((word: string) =>
                                        customTitleCase(word)
                                    )
                                    .join('') || '';
                            const value = context.raw;
                            return `${label}: ${value}`;
                        },
                    },
                },
            },
            maintainAspectRatio: true,
        };

        this.pieChartsBudgetUsed = {
            labels: labels,
            datasets: [
                {
                    data: budgetsUsed,
                    backgroundColor: [
                        documentStyle.getPropertyValue('--cyan-500'),
                        documentStyle.getPropertyValue('--bluegray-500'),
                        documentStyle.getPropertyValue('--red-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--cyan-400'),
                        documentStyle.getPropertyValue('--bluegray-400'),
                        documentStyle.getPropertyValue('--red-400'),
                    ],
                },
            ],
        };

        this.PieChartBudgetUsedOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                    },
                },
                datalabels: {
                    formatter: (value: number) => abbreviateNumber(value),
                    color: textColor,
                    font: {
                        size: 15,
                    },
                },
            },
            maintainAspectRatio: true,
        };
    }
    async selectedBarChartDepartments(data: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        const labelsObjectiveName = [];
        const incompleteGoals = [];
        // const actualBudget = [];
        const completedGoals = [];
        // const monthData = [];
        // const currentMonth = new Date().getMonth() + 1; // Current month (1-12)
        data.forEach((goal) => {
            let objectiveName = goal.objectivesDetails.map(
                (e) => e.functional_objective
            );
            if (goal.department && goal.budget && goal.date_added) {
                // const dateAdded = new Date(goal.date_added);
                // const monthAdded = dateAdded.getMonth() + 1; // Month (1-12)
                labelsObjectiveName.push(objectiveName);
                // actualBudget.push(goal.budget);
                completedGoals.push(
                    goal.completion_percentage === 100
                        ? goal.completion_percentage
                        : 0
                );
                incompleteGoals.push(
                    goal.completion_percentage < 100
                        ? goal.completion_percentage
                        : 0
                );
                // monthData.push(monthAdded);
            }
        });

        const datasets = [
            {
                label: 'Completed',
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                data: completedGoals,
            },
            {
                label: 'Percentage',
                backgroundColor: documentStyle.getPropertyValue('--green-500'),
                borderColor: 'white',
                data: incompleteGoals,
            },
        ];

        this.barCharts = {
            labels: labelsObjectiveName,
            // labels: this.months({ count: currentMonth }),
            datasets: datasets,
        };

        this.options = {
            type: 'line',
            data: datasets,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
                x: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
            },
        };
    }
    onClearDepartment() {
        this.barCharts = [];
        this.selectedBarDepartmentDropdown = undefined;
        this.barChartType = 'line';
        this.thisBarCharts(this.goals);
    }

    async thisBarCharts(data: any = []) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        const labelsObjectiveName = [];
        const labelsOfficeName = [];
        const actualBudget = [];
        const actualBudgetCompleted = [];
        const budgetData = [];
        const monthData = [];
        const currentMonth = new Date().getMonth() + 1; // Current month (1-12)

        data.forEach((goal) => {
            let objectiveName = goal.objectivesDetails.map(
                (e) => e.functional_objective
            );
            let objectiveCompleted = goal.objectivesDetails.map((e) => {
                if (e.complete) {
                    actualBudgetCompleted.push(goal.budget);
                }
            });
            if (goal.department && goal.budget && goal.date_added) {
                const dateAdded = new Date(goal.date_added);
                const monthAdded = dateAdded.getMonth() + 1; // Month (1-12)
                labelsObjectiveName.push(objectiveName);
                actualBudget.push(goal.budget);
                budgetData.push(goal.remainingBudget);
                monthData.push(monthAdded);
            }
        });

        const datasets = [
            {
                label: 'Budget',
                backgroundColor: documentStyle.getPropertyValue('--green-500'),
                borderColor: 'white',
                data: budgetData,
                stack: 'combined',
                type: 'bar',
            },
            {
                label: 'Actual Budget',
                backgroundColor: documentStyle.getPropertyValue('--orange-500'),
                data: actualBudget,
                stack: 'combined',
            },
            {
                label: 'Completed',
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                data: actualBudgetCompleted,
                // stack: 'combined',
                type: 'bar',
            },
            // {
            //     label: 'Current Month',
            //     backgroundColor: 'rgba(255, 159, 64, 0.2)',
            //     borderColor: 'rgb(255, 159, 64)',
            //     data: Array(labelsObjectiveName.length).fill(currentMonth),
            // },
        ];

        this.barCharts = {
            // labels: this.months({ count: currentMonth }),
            labels: labelsObjectiveName,
            datasets: datasets,
        };

        this.options = {
            type: 'line',
            data: datasets,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
                x: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
            },
        };
    }

    getCurrentGoalAndActual(entry: any): string {
        // Parse the createdAt date into a Date object
        const createdAt = new Date(entry.createdAt);
        const currentDate = new Date(); // Get the current date

        // Calculate the difference in months from createdAt to currentDate
        const diffMonths =
            (currentDate.getFullYear() - createdAt.getFullYear()) * 12 +
            currentDate.getMonth() -
            createdAt.getMonth();

        // Check the frequency_monitoring field
        const frequency = entry.frequency_monitoring;

        if (frequency === 'yearly') {
            // Use the current month index directly
            const currentMonth = currentDate.getMonth() + 1;

            return `Goal: ${
                entry[`goal_month_${currentMonth}`] ?? 'Not Available'
            } | Actual: ${entry[`month_${currentMonth}`] ?? 'Not Available'}`;
        } else if (frequency === 'quarterly') {
            // Find the current quarter index (0 to 3)
            const currentQuarter = Math.floor(diffMonths / 3) % 4;

            return `Goal: ${
                entry[`goal_quarter_${currentQuarter}`] ?? 'Not Available'
            } | Actual: ${
                entry[`quarter_${currentQuarter}`] ?? 'Not Available'
            }`;
        } else if (frequency === 'semi_annual') {
            // Find the current half-year index (0 or 1)
            const currentHalf = Math.floor(diffMonths / 6) % 2;

            return `Goal: ${
                entry[`goal_semi_annual_${currentHalf}`] ?? 'Not Available'
            } | Actual: ${
                entry[`semi_annual_${currentHalf}`] ?? 'Not Available'
            }`;
        } else {
            // Return a fallback message for unsupported or undefined frequency
            return 'Frequency not supported or data not available';
        }
    }

    ngOnDestroy(): void {
        this.objectiveSubscription.unsubscribe();
    }
}

/*


ngOnInit() {
    this.userId = this.auth.getTokenUserID();
    this.loadCustomData();
}

loadCustomData() {
    this.loading = true;
    const data =
    const events = this.transformEvents(data);
    this.updateCalendarEvents(events);
    this.loading = false;
}

transformEvents(data: any[]): any[] {
    return data.map((item) => {
        const goalAchieved = item.quarter_0 >= item.goal_quarter_0 || item.month_0 >= item.goal_month_0 || item.semi_annual_0 >= item.goal_semi_annual_0;
        const title = `${item.goals.goals} - ${goalAchieved ? 'Achieved' : 'Pending'}`;
        const color = goalAchieved ? '#28a745' : '#dc3545';

        return {
            id: item.id,
            title: title,
            start: item.timetable[0] || new Date(),
            end: item.timetable[1] || new Date(),
            backgroundColor: color,
            borderColor: color,
            allDay: true,
            extendedProps: {
                user: item.users.username,
                imageUrl: this.auth.domain + item.users.profile_pic,
                goal: item.goal_quarter_0 || item.goal_month_0 || item.goal_semi_annual_0,
                actual: item.quarter_0 || item.month_0 || item.semi_annual_0,
            }
        };
    });
}

updateCalendarEvents(events: any[]) {
    this.calendarOptions.update((options) => ({
        ...options,
        events: events,
    }));
}


*/
