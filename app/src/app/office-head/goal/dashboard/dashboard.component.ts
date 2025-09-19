import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { ProductService } from 'src/app/demo/service/product.service';
import { Product } from 'src/app/demo/api/product';
import { AuthService } from 'src/app/demo/service/auth.service';
import { genericDropdown } from 'src/app/interface/campus.interface';
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
    donutData: any;
    donutOptions: any;
    goalForTables: any;
    USERID: any;
    officeListCombine: any;
    allObjectiveBudget: any;
    officeList: genericDropdown[] | undefined;
    selectedOffice: genericDropdown | undefined;
    totalBudget: number;
    usedBudget: number;
    remainingTotal: number;

    totalObjectivesCount: number = 0;
    completedObjectivesCount: number = 0;

    constructor(
        private goal: GoalService,
        private goalService: GoalService,
        private obj: ObjectiveService,
        private productService: ProductService,
        private auth: AuthService
    ) {}

    ngOnInit() {
        this.productService
            .getProductsWithOrdersSmall()
            .then((data) => (this.products = data));
        this.USERID = this.auth.getTokenUserID();
        this.getAllObjectivesForTable();
        this.getGoals();
        this.getObjectiveViewPieChart();
        this.getAllObjectives();
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
    getAllObjectivesForTable(office?: any) {
        this.obj
            .fetch(
                'get',
                'office_head_query',
                `getAllObjectivesWithObjectivesForOfficeHead/${this.USERID}`
            )
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.goals = data.goals || [];

                console.log(this.getTotalObjectivesAndCompleted(this.goals));
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

    getTotalObjectivesAndCompleted(goals: any[]): {
        total: number;
        completed: number;
    } {
        let total = 0;
        let completed = 0;
        goals.forEach((goal) => {
            total += goal.objectivesDetails.length;
            completed += goal.objectivesDetails.filter(
                (o) => o.complete
            ).length;
        });
        this.totalObjectivesCount = total;
        this.completedObjectivesCount = completed;
        return { total, completed };
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
                'office_head_query',
                `getAllObjectivesUnderAOfficeHeadV2/${this.USERID}`
            )
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data?: any) => {
                this.initBarCharts(data?.objectiveCompletions || []);
            });
    }

    ngOnDestroy(): void {
        this.dashboardSubscription.unsubscribe();
    }
    initBarCharts(goal?: any) {
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

        const datasets = goal.map((goal) => {
            const backgroundColors = goal.objectivesDetails.map(() =>
                getIncrementalColor()
            );
            const borderColors = backgroundColors.map((color) => color);

            return {
                label: goal.goals,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                data: goal.objectivesDetails.map((obj) => obj.budget),
            };
        });

        const labels = goal.flatMap((goal) =>
            goal.objectivesDetails.map((obj) => obj.functional_objective)
        );

        this.donutData = {
            labels: labels,
            datasets: datasets,
        };

        this.donutOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
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
                        color: surfaceBorder,
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
        this.loading = false;
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
        this.getAllObjectivesForTable(event.value.name);
    }
    onClearOffice() {
        this.goals = [];
        this.getAllObjectivesForTable();
    }

    getObjectiveNames(goal: any): number {
        return (
            goal.objectivesDetails
                ?.filter((o) => o.functional_objective)
                .map((o) => o.functional_objective)
                .join(', ') || ''
        );
    }
}
