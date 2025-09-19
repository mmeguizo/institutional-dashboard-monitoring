import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { ProductService } from 'src/app/demo/service/product.service';
import { Product } from 'src/app/demo/api/product';
import { AuthService } from 'src/app/demo/service/auth.service';

interface expandedRows {
    [key: string]: boolean;
}
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class GoalDashboardComponent implements OnInit, OnDestroy {
    dashboardSubscription = new Subject<void>();
    goals: any[] = [];
    products: Product[] = [];
    loading = true;
    barOptions: any;
    barData: any;
    objectiveBudget: number;
    isExpanded: boolean = false;
    expandedRows: expandedRows = {};
    totalObjectives: any;
    completedObjectives: any;
    myChart: any;
    goalCount: any;
    donutData: {
        labels: any[];
        datasets: {
            label: string;
            backgroundColor: string;
            borderColor: string;
            data: any[];
        }[];
    };
    donutOptions: {
        plugins: { legend: { labels: { fontColor: string } } };
        scales: {
            x: {
                ticks: { color: string; font: { weight: number } };
                grid: { display: boolean; drawBorder: boolean };
            };
            y: {
                ticks: { color: string };
                grid: { color: string; drawBorder: boolean };
            };
        };
    };
    goalForTables: any;
    USERID: string;

    constructor(
        private goal: GoalService,
        private goalService: GoalService,
        private obj: ObjectiveService,
        private auth: AuthService,
        private productService: ProductService
    ) {
        this.USERID = this.auth.getTokenUserID() || localStorage.getItem('id');
        this.getGoals();
        this.getObjectiveViewPieChart();
        this.getAllObjectives();
    }

    ngOnInit() {
        this.productService
            .getProductsWithOrdersSmall()
            .then((data) => (this.products = data));

        this.obj
            .fetch(
                'get',
                'objectives',
                `getAllObjectivesForDashboard/${this.USERID}`
            )
            .subscribe({
                next: (data: any) => {
                    this.totalObjectives = data.data[0].objectivesCount;
                    this.completedObjectives = data.data[0].objectiveCompleted;
                    this.completedObjectives =
                        data.data[0].objectiveUncompleted;
                    // this.createChart(); // Call to create the chart after data is fetched
                },
                error: (error) => {
                    console.error('Error fetching objectives:', error);
                    // Handle the error appropriately
                },
            });

        this.getAllObjectivesForTable();
    }

    getCompletedObjectives(goal: any): number {
        return (
            goal.objectivesDetails?.filter((o) => o.complete && !o.deleted)
                .length || 0
        );
    }

    getIncompleteObjectives(goal: any): number {
        return (
            goal.objectivesDetails?.filter((o) => !o.complete && !o.deleted)
                .length || 0
        );
    }

    // createChart() {
    //     const documentStyle = getComputedStyle(document.documentElement);

    //     this.barData = {
    //         labels: ['Goals'],
    //         datasets: [
    //             {
    //                 label: 'Goals',
    //                 backgroundColor:
    //                     documentStyle.getPropertyValue('--primary-500'),
    //                 data: [this.goalCount],
    //             },
    //             {
    //                 label: 'Total Objectives',
    //                 backgroundColor:
    //                     documentStyle.getPropertyValue('--primary-400'),
    //                 data: [this.totalObjectives],
    //             },
    //             {
    //                 label: 'Completed Objectives',
    //                 backgroundColor:
    //                     documentStyle.getPropertyValue('--green-500'),
    //                 data: [this.completedObjectives],
    //             },
    //             {
    //                 label: 'Incomplete Objectives',
    //                 backgroundColor:
    //                     documentStyle.getPropertyValue('--orange-500'),
    //                 data: [this.completedObjectives],
    //             },
    //         ],
    //     };

    //     this.barOptions = {
    //         plugins: {
    //             legend: {
    //                 labels: {
    //                     color: documentStyle.getPropertyValue('--text-color'),
    //                 },
    //             },
    //         },
    //         scales: {
    //             x: {
    //                 stacked: true,
    //                 ticks: {
    //                     color: documentStyle.getPropertyValue(
    //                         '--text-color-secondary'
    //                     ),
    //                 },
    //                 grid: {
    //                     color: documentStyle.getPropertyValue('--surface-d'),
    //                 },
    //             },
    //             y: {
    //                 stacked: true,
    //                 ticks: {
    //                     color: documentStyle.getPropertyValue(
    //                         '--text-color-secondary'
    //                     ),
    //                 },
    //                 grid: {
    //                     color: documentStyle.getPropertyValue('--surface-d'),
    //                 },
    //             },
    //         },
    //     };

    //     const ctx = document.getElementById('myChart') as HTMLCanvasElement; // Replace with your canvas element's ID
    //     this.myChart = new Chart(ctx, {
    //         type: 'bar',
    //         data: this.barData,
    //         options: this.barOptions,
    //     });
    // }

    getGoals() {
        this.goal
            .fetch('get', 'goals', `getGoalsForDashboard/${this.USERID}`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.goalForTables =
                    data?.data[0]?.totalBudget[0]?.totalAmount || 0;
                this.goalCount = data?.data[0]?.goalCount;
                this.loading = false;
            });
    }

    getAllObjectives() {
        this.obj
            .fetch('get', 'objectives', `getAllObjectivesBudget/${this.USERID}`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.objectiveBudget = data.data;
            });
    }
    getAllObjectivesForTable() {
        this.obj
            .fetch(
                'get',
                'goals',
                `getAllObjectivesWithObjectives/${this.USERID}`
            )
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.goals = data.goals;
            });
    }

    getObjectiveViewPieChart() {
        this.goalService
            .fetch('get', 'goals', `getObjectivesViewTable/${this.USERID}`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data?: any) => {
                this.initBarCharts(data?.data || []);
            });
    }

    ngOnDestroy(): void {
        this.dashboardSubscription.unsubscribe();
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

        this.donutData = {
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

        this.donutOptions = {
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

    expandAll() {
        if (!this.isExpanded) {
            this.products.forEach((product) =>
                product && product.name
                    ? (this.expandedRows[product.name] = true)
                    : ''
            );
        } else {
            this.expandedRows = {};
        }
        this.isExpanded = !this.isExpanded;
    }
}
