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
// import {
//     CalendarOptions,
//     DateSelectArg,
//     EventClickArg,
//     EventApi,
// } from '@fullcalendar/core';
// import interactionPlugin from '@fullcalendar/interaction';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import listPlugin from '@fullcalendar/list';
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
    goalBarChartList: IdepartmentDashboardDropdown[] | undefined;

    private objectiveSubscription = new Subject<void>();

    // currentEvents = signal<EventApi[]>([]);
    loading = true;
    userId: string;
    users: any;
    USERID: string;
    getAllObjectivesUnderAVicePresidentData: any;

    PieChartOptions: any;
    goals: any;
    private getDashboardSubscription = new Subject<void>();
    objectivePieData: any;
    objectiveDoughnutData: any;
    chartOptions: any;
    deparmentData: any;
    objectivesData: any;
    options: any;
    barData: any;
    barOptions: any;
    NewGoals: any;
    cities: any[];
    countries: any[] = [];
    campusList: IcampusDropdown[] | undefined;
    selectedBarDepartmentDropdown: IdepartmentDropdown | undefined;

    selectedCampusDropdown: IcampusDropdown | undefined;

    selectedAgoal: Boolean = false;

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

    barCharts: any;
    pieCharts: any;
    completedGoalsFromApi: any;
    uncompletedGoalsFromApi: any;

    pieChartsBudgetUsed: any;
    PieChartBudgetUsedOptions: any;
    pieChartsBudgetRemaining: any;
    pieChartsBudgetRemainingOptions: any;
    pieChartsPercentage: any;
    pieChartsPercentageOptions: any;

    pieChartsObjectives: any;
    pieChartsObjectivesOptions: any;
    pieChartsGoals: any;
    pieChartsGoalsOptions: any;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private obj: ObjectiveService,
        private auth: AuthService,
        public userService: UserService,
        private messageService: MessageService
    ) {
        this.USERID = this.auth.getTokenUserID();
    }

    ngOnInit() {
        this.userId = this.auth.getTokenUserID();
        // this.getAllobjectivesGoalsUsers();
        this.getAllObjectivesUnderAVicePresident();
        this.getAllusersUnderVicePresidents();
        this.getAllObjectivesWithObjectivesForCharts();
    }

    async getAllObjectivesUnderAVicePresident() {
        await this.userService
            .fetch(
                'get',
                'vice_president_query',
                `getAllObjectivesUnderAVicePresident/${this.USERID}`
            )
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                this.getAllObjectivesUnderAVicePresidentData = data;
                this.completedGoalsFromApi = data.completedGoals;
                this.uncompletedGoalsFromApi = data.uncompletedGoals;
                this.goals = data.goals || [];
                this.goalBarChartList = data.dropdown || [];
                this.pieChart(data.goals || this.goals || []);
                this.thisBarCharts(data.goals);
                this.processDashboardData(data);
            });
    }

    async getAllusersUnderVicePresidents() {
        await this.userService
            .fetch(
                'get',
                'vice_president_query',
                `getAllUsersForDashboardVP/${this.USERID}`
            )
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                this.users = data.data;
            });
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

    async getAllObjectivesWithObjectivesForCharts(campus?: string) {
        this.loading = true;
        this.obj
            .fetch(
                'get',
                'vice_president_query',
                `getAllObjectivesWithObjectivesForCharts/${this.USERID}`
            )
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe({
                next: (data: any) => {
                    console.log({
                        getAllObjectivesWithObjectivesForCharts: data,
                    });
                    this.goals = data.goals || [];
                    this.goalBarChartList = data.dropdown || [];
                    this.pieChart(data.goals || this.goals || []);
                    this.thisBarCharts(data.goals);
                    this.processDashboardData(data);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error fetching data:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to fetch goals',
                    }); // Display error message
                    this.loading = false;
                },
            });
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
    async pieChart(data: any[] = []) {
        console.log({ pieChart: data });

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        const labels = data.map((goal: any) => goal.department);

        const budgets = data.map(
            (goal: any) => goal.budgetMinusAllObjectiveBudget
        );
        const budgetsUsed = data.map(
            (goal: any) => goal.budgetMinusAllObjectiveBudget
        );
        const budgetsRemaining = data.map((goal: any) => goal.remainingBudget);

        const percentageCompletion = data.map(
            (goal: any) => goal.completion_percentage
        );

        // const abbreviateNumber = (value: number) => {
        //     if (value >= 1_000_000) {
        //         return (value / 1_000_000).toFixed(1) + 'M';
        //     } else if (value >= 1_000) {
        //         return (value / 1_000).toFixed(1) + 'k';
        //     } else {
        //         return value.toString();
        //     }
        // };

        const abbreviatePercentage = (value: number) => {
            return value + '%';
        };

        console.log({ labels, budgets });
        this.pieCharts = {
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

        this.pieChartsBudgetRemaining = {
            labels: labels,
            datasets: [
                {
                    data: budgetsRemaining,
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--orange-500'),
                        documentStyle.getPropertyValue('--green-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--orange-400'),
                        documentStyle.getPropertyValue('--green-400'),
                    ],
                },
            ],
        };

        this.pieChartsBudgetRemainingOptions = {
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

        this.pieChartsPercentage = {
            labels: labels,
            datasets: [
                {
                    data: percentageCompletion,
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--orange-500'),
                        documentStyle.getPropertyValue('--green-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--orange-400'),
                        documentStyle.getPropertyValue('--green-400'),
                    ],
                },
            ],
        };

        this.pieChartsPercentageOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                    },
                },
                datalabels: {
                    formatter: (value: number) => abbreviatePercentage(value),
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
                            return `${label}: ${value}%`;
                        },
                    },
                },
            },
            maintainAspectRatio: true,
        };

        // goal charts

        const goalsData = data.map((goal) => {
            const totalObjectives = goal.objectivesDetails.length;
            const completedObjectives = goal.objectivesDetails.filter(
                (obj) => obj.complete
            ).length;
            const pendingObjectives = totalObjectives - completedObjectives;

            return {
                goal: goal.goals,
                totalObjectives,
                completedObjectives,
                pendingObjectives,
            };
        });

        const totalObjectives = goalsData.map((g) => g.totalObjectives);
        const completedObjectives = goalsData.map((g) => g.completedObjectives);
        const pendingObjectivesObjectives = goalsData.map(
            (g) => g.pendingObjectives
        );

        const totalObjectivesSum = totalObjectives.reduce(
            (sum, value) => sum + value,
            0
        );
        const completedObjectivesSum = completedObjectives.reduce(
            (sum, value) => sum + value,
            0
        );
        const pendingObjectivesSum = pendingObjectivesObjectives.reduce(
            (sum, value) => sum + value,
            0
        );
        this.pieChartsObjectives = {
            labels: [
                'Total Objectives',
                'Completed Objectives',
                'Pending Objectives',
            ],
            datasets: [
                {
                    data: [
                        totalObjectivesSum,
                        completedObjectivesSum,
                        pendingObjectivesSum,
                    ],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--red-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--green-400'),
                        documentStyle.getPropertyValue('--red-400'),
                    ],
                },
            ],
        };

        this.pieChartsObjectivesOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                    },
                },
                datalabels: {
                    formatter: (value: number, context: any) => {
                        const label = (
                            context.chart.data.labels[context.dataIndex] || ''
                        ).split(' ')[0];
                        return `${label}: ${value.toString()}`;
                    },
                    color: textColor,
                    font: {
                        size: 13,
                    },
                },
            },
            maintainAspectRatio: true,
        };

        const goalsSummary = data.reduce(
            (acc, goal) => {
                acc.totalGoals++;
                if (goal.completion_percentage === 100) {
                    acc.completedGoals++;
                } else {
                    acc.pendingGoals++;
                }
                return acc;
            },
            { totalGoals: 0, completedGoals: 0, pendingGoals: 0 }
        );

        this.pieChartsGoals = {
            labels: ['Completed Goals', 'Pending Goals'],
            datasets: [
                {
                    data: [
                        goalsSummary.completedGoals,
                        goalsSummary.pendingGoals,
                    ],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--red-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--green-400'),
                        documentStyle.getPropertyValue('--red-400'),
                    ],
                },
            ],
        };

        this.pieChartsGoalsOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                    },
                },
                datalabels: {
                    formatter: (value: number, context: any) => {
                        const label = (
                            context.chart.data.labels[context.dataIndex] || ''
                        ).split(' ')[0];
                        return `${label}: ${value.toString()}`;
                    },
                    color: textColor,
                    font: {
                        size: 13,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const label = context.label || '';
                            const value = context.raw;
                            return `${label}: ${value}`;
                        },
                    },
                },
            },
            maintainAspectRatio: true,
        };
    }

    ngOnDestroy(): void {
        this.objectiveSubscription.unsubscribe();
    }
}

/*

    // calendarOptions = signal<CalendarOptions>({
    //     plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    //     headerToolbar: {
    //         // left: 'prev,next today',
    //         center: 'title',
    //         right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    //     },
    //     initialView: 'dayGridMonth',
    //     weekends: true,
    //     editable: false,
    //     selectable: false,
    //     selectMirror: true,
    //     dayMaxEvents: false,
    //     navLinks: false,
    //     // select: this.handleDateSelect.bind(this),
    //     // eventClick: this.handleEventClick.bind(this),
    //     // eventsSet: this.handleEvents.bind(this),
    // });

  // getAllobjectivesGoalsUsers() {
    //     this.loading = true;
    //     this.obj
    //         .fetch(
    //             'get',
    //             'objectives',
    //             `getObjectiveForCalendar/${this.userId}`
    //         )
    //         .pipe(takeUntil(this.objectiveSubscription))
    //         .subscribe((data: any) => {
    //             const events = this.transformEvents(data.data);
    //             this.updateCalendarEvents(events);
    //             this.loading = false;
    //         });
    // }

    transformEvents(data: any[]): any[] {
        // return data.map((item) => {
        //     const title =
        //         ` ${item.functional_objective.toUpperCase()} : ` +
        //         this.getCurrentGoalAndActual(item);
        //     let endDate = new Date(item.createdAt);
        //     if (item.frequency_monitoring === 'yearly') {
        //         // endDate.setFullYear(endDate.getFullYear() + 1);
        //         endDate = this.getEndDateAfter12Months(item.createdAt);
        //     } else if (item.frequency_monitoring === 'semi_annual') {
        //         // endDate.setMonth(endDate.getMonth() + 6);
        //         endDate = this.getEndDateAfter6Months(item.createdAt);
        //     } else if (item.frequency_monitoring === 'quarterly') {
        //         // endDate.setMonth(endDate.getMonth() + 3);
        //         endDate = this.getEndDateAfter3Months(item.createdAt);
        //     }

        //     return {
        //         id: item.id,
        //         title: title,
        //         start: item.createdAt,
        //         end: endDate,
        //         backgroundColor: item.completed ? '#1f6f78' : '#2c5d63',
        //         borderColor: '#352f44',
        //         allDay: true,
        //         extendedProps: {
        //             user: item.users.username,
        //             imageUrl: this.auth.domain + item.users.profile_pic,
        //             goal:
        //                 item.goal_quarter_0 ||
        //                 item.goal_month_0 ||
        //                 item.goal_semi_annual_0,
        //             actual:
        //                 item.quarter_0 || item.month_0 || item.semi_annual_0,
        //         },
        //     };
        // });
        return [];
    }
    getCurrentGoalAndActual(entry: any): string {
        return 'test';
        // // Parse the createdAt date into a Date object
        // const createdAt = new Date(entry.createdAt);
        // const currentDate = new Date(); // Get the current date

        // // Calculate the difference in months from createdAt to currentDate
        // const diffMonths =
        //     (currentDate.getFullYear() - createdAt.getFullYear()) * 12 +
        //     currentDate.getMonth() -
        //     createdAt.getMonth();

        // // Check the frequency_monitoring field
        // const frequency = entry.frequency_monitoring;

        // if (frequency === 'yearly') {
        //     // Use the current month index directly
        //     const currentMonth = currentDate.getMonth() + 1;

        //     return `Goal: ${
        //         entry[`goal_month_${currentMonth}`] ?? 'Not Available'
        //     } | Actual: ${entry[`month_${currentMonth}`] ?? 'Not Available'}`;
        // } else if (frequency === 'quarterly') {
        //     // Find the current quarter index (0 to 3)
        //     const currentQuarter = Math.floor(diffMonths / 3) % 4;

        //     return `Goal: ${
        //         entry[`goal_quarter_${currentQuarter}`] ?? 'Not Available'
        //     } | Actual: ${
        //         entry[`quarter_${currentQuarter}`] ?? 'Not Available'
        //     }`;
        // } else if (frequency === 'semi_annual') {
        //     // Find the current half-year index (0 or 1)
        //     const currentHalf = Math.floor(diffMonths / 6) % 2;

        //     return `Goal: ${
        //         entry[`goal_semi_annual_${currentHalf}`] ?? 'Not Available'
        //     } | Actual: ${
        //         entry[`semi_annual_${currentHalf}`] ?? 'Not Available'
        //     }`;
        // } else {
        //     // Return a fallback message for unsupported or undefined frequency
        //     return 'Frequency not supported or data not available';
        // }
    }

    getEndDateAfter12Months(createdAt) {
        // // Parse the input 'createdAt' into a Date object
        // let startDate = new Date(createdAt);
        // // Create a new Date object for the end date
        // let endDate = new Date(startDate);
        // // Add 12 months
        // endDate.setMonth(endDate.getMonth() + 12);
        // return endDate;
    }

    getEndDateAfter6Months(createdAt) {
        // // Parse the input 'createdAt' into a Date object
        // let startDate = new Date(createdAt);
        // // Create a new Date object for the end date
        // let endDate = new Date(startDate);
        // // Add 6 months
        // endDate.setMonth(endDate.getMonth() + 6);
        // return endDate;
    }

    getEndDateAfter3Months(createdAt) {
        // Parse the input 'createdAt' into a Date object
        // let startDate = new Date(createdAt);
        // // Create a new Date object for the end date
        // let endDate = new Date(startDate);
        // // Add 3 months
        // endDate.setMonth(endDate.getMonth() + 3);
        // return endDate;
    }

    updateCalendarEvents(events: any[]) {
        // this.calendarOptions.update((options) => ({
        //     ...options,
        //     events: events,
        // }));
    }



    handleCalendarToggle() {
        // this.calendarVisible.update((bool) => !bool);
    }

    handleWeekendsToggle() {
        // this.calendarOptions.update((options) => ({
        //     ...options,
        //     weekends: !options.weekends,
        // }));
    }

    handleDateSelect(selectInfo: DateSelectArg) {}

    handleEventClick(clickInfo: EventClickArg) {
        // if (
        //     confirm(
        //         `Are you sure you want to delete the event '${clickInfo.event.title}'`
        //     )
        // ) {
        //     clickInfo.event.remove();
        // }
    }

    handleEvents(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }

 // async pieChart(data: any = []) {
    //     const documentStyle = getComputedStyle(document.documentElement);
    //     const textColor = documentStyle.getPropertyValue('--text-color');

    //     const labels = data.map((goal) => goal.department);
    //     const budgets = data.map((goal) => goal.budget);
    //     const generateRandomColor = () => {
    //         const r = Math.floor(Math.random() * 256);
    //         const g = Math.floor(Math.random() * 256);
    //         const b = Math.floor(Math.random() * 256);
    //         return `rgba(${r}, ${g}, ${b}, 0.2)`;
    //     };

    //     const backgroundColors = labels.map(() => generateRandomColor());
    //     const hoverBackgroundColors = backgroundColors.map((color) =>
    //         color.replace('0.2', '0.4')
    //     );

    //     this.pieCharts = data = {
    //         labels: labels,
    //         datasets: [
    //             {
    //                 data: budgets,
    //                 backgroundColor: [
    //                     documentStyle.getPropertyValue('--blue-500'),
    //                     documentStyle.getPropertyValue('--yellow-500'),
    //                     documentStyle.getPropertyValue('--green-500'),
    //                 ],
    //                 hoverBackgroundColor: [
    //                     documentStyle.getPropertyValue('--blue-400'),
    //                     documentStyle.getPropertyValue('--yellow-400'),
    //                     documentStyle.getPropertyValue('--green-400'),
    //                 ],
    //             },
    //         ],
    //     };

    //     this.PieChartOptions = {
    //         plugins: {
    //             legend: {
    //                 labels: {
    //                     usePointStyle: true,
    //                     color: textColor,
    //                 },
    //             },
    //         },
    //         maintainAspectRatio: true,
    //     };
    // }

*/
