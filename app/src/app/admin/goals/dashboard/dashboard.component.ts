import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { ProductService } from 'src/app/demo/service/product.service';
import { Product } from 'src/app/demo/api/product';
import { genericDropdown } from 'src/app/interface/campus.interface';
import { AuthService } from 'src/app/demo/service/auth.service';
import {
    abbreviateNumber,
    formatFrequencyString,
} from 'src/app/utlis/general-utils';

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
    loading = false;
    barOptions: any;
    barData: any;
    objectiveBudget: number;
    isExpanded: boolean = false;
    expandedRows: expandedRows = {};
    totalObjectives: any;
    completedObjectives: any;
    myChart: any;
    goalCount: any;
    donutData: any;
    donutOptions: any;
    goalForTables: any;

    selectedOffice: genericDropdown | undefined;
    officeList: genericDropdown[] | undefined;
    totalBudget: number;
    usedBudget: number;
    remainingTotal: number;
    officeListCombine: any;
    allObjectiveBudget: any;

    constructor(
        private goal: GoalService,
        private goalService: GoalService,
        private obj: ObjectiveService,
        private productService: ProductService,
        public auth: AuthService
    ) {}

    ngOnInit() {
        this.loading = true;
        this.productService
            .getProductsWithOrdersSmall()
            .then((data) => (this.products = data));
        this.getAllObjectivesForTable();
        this.getGoals();
        this.getObjectiveViewPieChart();
        this.getAllObjectives();
        this.loading = false;
    }

    getCompletedObjectives(goal: any): number {
        return (
            goal.objectivesDetails?.filter((o) => o.complete && !o.deleted)
                .length || 0
        );
    }

    getObjectiveNames(goal: any): number {
        return (
            goal.objectivesDetails
                ?.filter((o) => o.functional_objective)
                .map((o) => o.functional_objective)
                .join(', ') || ''
        );
    }

    getIncompleteObjectives(goal: any): number {
        return (
            goal.objectivesDetails?.filter((o) => !o.complete && !o.deleted)
                .length || 0
        );
    }

    getGoals() {
        this.goal
            .fetch('get', 'goals', 'getGoalsForDashboard')
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                console.log({ getGoals: data });
                this.goalForTables =
                    data?.data[0]?.totalBudget[0]?.totalAmount || 0;
                this.goalCount = data?.data[0]?.goalCount;
            });
    }

    formatFrequencyString(frequency: string) {
        return formatFrequencyString(frequency);
    }

    getAllObjectives() {
        // this.obj
        //     .fetch('get', 'objectives', `getAllObjectivesBudget`)
        //     .pipe(takeUntil(this.dashboardSubscription))
        //     .subscribe((data: any) => {
        //         this.objectiveBudget = data.data;
        //     });
    }
    getAllObjectivesForTable(office?: any) {
        this.goals = [];

        this.obj
            .fetch('get', 'goals', `getAllObjectivesWithObjectives/${office}`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                console.log({ getAllObjectivesForTable: data });
                this.allObjectiveBudget = data.goals
                    .map((o: any) =>
                        o.objectivesDetails
                            .map((o: any) => o.budget)
                            .reduce((a: any, b: any) => a + b, 0)
                    )
                    .reduce((a: any, b: any) => a + b, 0);
                this.goals = data.goals;
                this.calculateBudget(data.goals);
                this.calculateUsed(data.goals);
                this.calculateRemaining(data.goals);
                this.officeList = data.office_dropdown;
                this.officeListCombine = data.office_dropdown
                    .map((office: any) => office.name)
                    .join(', ');
            });
    }

    getObjectiveViewPieChart() {
        this.goalService
            .fetch('get', 'goals', `getObjectivesViewTable`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data?: any) => {
                console.log(data);
                this.initBarCharts(data?.goals || []);
            });
    }

    ngOnDestroy(): void {
        this.dashboardSubscription.unsubscribe();
    }
    async initBarCharts(goal?: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        // Function to generate random color
        const getIncrementalColor = () => {
            const randomColor = [
                Math.floor(Math.random() * 256), // Red
                Math.floor(Math.random() * 256), // Green
                Math.floor(Math.random() * 256), // Blue
            ];

            // Return the color in rgba format with fixed alpha of 0.5
            return `rgba(${randomColor[0]}, ${randomColor[1]}, ${randomColor[2]}, 0.5)`;
        };

        const labels: string[] = [];
        const dataGoal: number[] = [];
        const dataGoalObjective: number[] = [];
        const dataObjectiveBudget: number[] = [];

        goal.forEach((t: any) => {
            labels.push(t.department);
            dataGoal.push(t.budget);
            dataGoalObjective.push(
                t.objectivesDetails
                    .map((o: any) => o.budget)
                    .reduce((a: any, b: any) => a + b, 0)
            );
            dataObjectiveBudget.push(
                t.objectivesDetails.map((o: any) => o.budget)
            );
        });

        this.donutData = {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Objective Budget',
                    data: dataObjectiveBudget,
                    backgroundColor:
                        documentStyle.getPropertyValue('--green-500'),
                    borderWidth: 1,
                },
                {
                    type: 'bar',
                    label: 'Total Budget',
                    data: dataGoalObjective,
                    backgroundColor:
                        documentStyle.getPropertyValue('--blue-500'),
                    borderWidth: 1,
                },
            ],
        };

        this.donutOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    labels: {
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
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
                y: {
                    stacked: true,
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

    onChangeOffice(event: any = '') {
        //reset the goals
        this.goals = [];
        this.getAllObjectivesForTable(event?.value?.name);
    }

    onClearOffice() {
        this.goals = [];
        this.getAllObjectivesForTable();
    }

    calculateBudget(goals: any) {
        let total = 0;
        for (let calc of goals) {
            total += calc.budget;
        }

        this.totalBudget = total;
    }

    calculateUsed(goals: any) {
        let total = 0;
        for (let calc of goals) {
            total += calc.budgetMinusAllObjectiveBudget;
        }

        this.usedBudget = total;
    }
    calculateRemaining(goals: any) {
        let total = 0;
        for (let calc of goals) {
            total += calc.remainingBudget;
        }
        this.remainingTotal = total;
    }
}
