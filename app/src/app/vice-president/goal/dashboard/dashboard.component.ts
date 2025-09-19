import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { ProductService } from 'src/app/demo/service/product.service';
import { Product } from 'src/app/demo/api/product';
import { AuthService } from 'src/app/demo/service/auth.service';
import { genericDropdown } from 'src/app/interface/campus.interface';
import { formatFrequencyString } from 'src/app/utlis/general-utils';
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
    USERID: any;
    officeList: genericDropdown[] | undefined;
    selectedOffice: genericDropdown | undefined;
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
        private auth: AuthService
    ) {}

    ngOnInit() {
        this.loading = true;
        this.productService
            .getProductsWithOrdersSmall()
            .then((data) => (this.products = data));
        this.USERID = this.auth.getTokenUserID();
        this.getAllObjectivesForTableInit();
        // this.getAllObjectivesForTable();
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

    getIncompleteObjectives(goal: any): number {
        return (
            goal.objectivesDetails?.filter((o) => !o.complete && !o.deleted)
                .length || 0
        );
    }

    onChangeOffice(event: any = '') {
        //reset the goals
        this.goals = [];

        if (event?.value?.name) {
            this.getAllObjectivesForTable(event?.value?.name);
        } else {
            this.getAllObjectivesForTableInit();
        }
    }
    onClearOffice() {
        this.goals = [];
        this.getAllObjectivesForTableInit();
    }

    getGoals() {
        this.goal
            .fetch(
                'get',
                'vice_president_query',
                `getGoalsForDashboardVicePresident/${this.USERID}`
            )
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.goalForTables =
                    data?.data[0]?.totalBudget[0]?.totalAmount || 0;
                this.goalCount = data?.data[0]?.goalCount;
            });
    }

    getAllObjectives() {
        this.obj
            .fetch('get', 'objectives', `getAllObjectivesBudget/` + this.USERID)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.objectiveBudget = data.data;
            });
    }
    getAllObjectivesForTable(office?: any) {
        this.obj
            .fetch(
                'get',
                'vice_president_query',
                `getAllObjectivesWithObjectivesForVicePresident/${office}`
            )
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.goals = data.goals || [];
                this.allObjectiveBudget = this.goals
                    .map((o: any) =>
                        o.objectivesDetails
                            .map((o: any) => o.budget)
                            .reduce((a: any, b: any) => a + b, 0)
                    )
                    .reduce((a: any, b: any) => a + b, 0);

                this.calculateBudget(this.goals);
                this.calculateUsed(this.goals);
                this.calculateRemaining(this.goals);
                this.officeList = data.office_dropdown || [];
                this.officeListCombine = this.officeList
                    .map((office: any) => office.name)
                    .join(', ');
            });
    }
    getAllObjectivesForTableInit() {
        this.obj
            .fetch(
                'get',
                'vice_president_query',
                `getAllObjectivesWithObjectivesForVicePresidentInit/${this.USERID}`
            )
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.goals = data.goals || [];
                this.allObjectiveBudget = this.goals
                    .map((o: any) =>
                        o.objectivesDetails
                            .map((o: any) => o.budget)
                            .reduce((a: any, b: any) => a + b, 0)
                    )
                    .reduce((a: any, b: any) => a + b, 0);

                this.calculateBudget(this.goals);
                this.calculateUsed(this.goals);
                this.calculateRemaining(this.goals);
                this.officeList = data.office_dropdown || [];
                this.officeListCombine = this.officeList
                    .map((office: any) => office.name)
                    .join(', ');
            });
    }

    getObjectiveNames(goal: any): number {
        return (
            goal.objectivesDetails
                ?.filter((o) => o.functional_objective)
                .map((o) => o.functional_objective)
                .join(', ') || ''
        );
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

    getObjectiveViewPieChart() {
        this.goalService
            .fetch(
                'get',
                'vice_president_query',
                `getObjectivesViewTableVicePresident/${this.USERID}`
            )
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data?: any) => {
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
        const dataRemainingBudget: number[] = [];

        goal.forEach((t: any) => {
            labels.push(t.department);
            dataGoal.push(t.budget);
            dataGoalObjective.push(
                t.objectivesDetails
                    .map((o: any) => o.budget)
                    .reduce((a: any, b: any) => a + b, 0)
            );
            dataRemainingBudget.push(t.remainingBudget);
        });

        this.donutData = {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Goal Budget',
                    data: dataGoal,
                    backgroundColor:
                        documentStyle.getPropertyValue('--blue-500'),
                    borderWidth: 1,
                },
                {
                    type: 'bar',
                    label: 'Goal Remaining',
                    data: dataRemainingBudget,
                    backgroundColor:
                        documentStyle.getPropertyValue('--green-500'),
                    borderWidth: 1,
                },
                {
                    type: 'bar',
                    label: 'Objective Budget Total',
                    data: dataGoalObjective,
                    backgroundColor:
                        documentStyle.getPropertyValue('--yellow-500'),
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

    formatFrequencyString(frequency: string) {
        return formatFrequencyString(frequency);
    }
}
