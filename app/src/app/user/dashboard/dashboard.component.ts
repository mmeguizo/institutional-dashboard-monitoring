import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth.service';
import { GoalService } from 'src/app/demo/service/goal.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
    users: any;
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
    userId: string;

    constructor(
        private goalService: GoalService,
        private obj: ObjectiveService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.userId = this.authService.getTokenUserID();
        this.getAllGoals();
        this.getAllObjectives();
        this.getObjectiveViewPieChart();
    }
    ngOnDestroy() {
        this.getDashboardSubscription.unsubscribe();
    }

    getAllGoals() {
        this.goalService
            .fetch('get', 'goals', `getGoalsForUserDashboard/${this.userId}`)
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.goals = data.data[0];
            });
    }

    getAllObjectives() {
        this.obj
            .fetch(
                'get',
                'objectives',
                `getAllObjectivesForDashboard/${this.userId}`
            )
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.objectivesData = data.data[0];
                this.initChartsDoughnut({
                    complete: data.data[0].objectiveCompleted,
                    uncomplete: data.data[0].objectiveUncompleted,
                });
            });
    }

    getObjectiveViewPieChart() {
        this.goalService
            .fetch('get', 'goals', `getObjectivesViewTable/${this.userId}`)
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data?: any) => {
                this.initBarCharts(data?.data || []);
            });
    }

    initChartsDoughnut(data: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.objectiveDoughnutData = {
            labels: ['Complete', 'In Progress'],
            datasets: [
                {
                    data: [data.complete, data.uncomplete],
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

        this.options = {
            cutout: '65%',
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
        };
    }
    initBarCharts(goal?: any) {
        let objectivesData = goal?.map((e) => e.objectives);
        let objectivesDataTrue = goal?.map((e) =>
            e.objectives.filter((x) => x.deleted == false)
        );

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        this.barData = {
            labels: [...goal?.map((e) => e.goals)],
            datasets: [
                {
                    label: 'Goals',
                    backgroundColor:
                        documentStyle.getPropertyValue('--primary-500'),
                    borderColor:
                        documentStyle.getPropertyValue('--primary-500'),
                    data: [...goal?.map((e) => 1)],
                },
                {
                    label: 'Objectives',
                    backgroundColor:
                        documentStyle.getPropertyValue('--primary-200'),
                    borderColor:
                        documentStyle.getPropertyValue('--primary-200'),
                    data: [
                        ...objectivesDataTrue.map((e) =>
                            e.length ? e.length : 0
                        ),
                    ],
                },
            ],
        };

        this.barOptions = {
            plugins: {
                legend: {
                    labels: {
                        fontColor: textColor,
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500,
                        },
                    },
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                },
                y: {
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
}
