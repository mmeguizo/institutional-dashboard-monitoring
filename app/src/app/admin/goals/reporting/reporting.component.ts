import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { GoalService } from 'src/app/demo/service/goal.service';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-reporting',
    templateUrl: './reporting.component.html',
    styleUrl: './reporting.component.scss',
})
export class ReportingComponent implements OnInit, OnDestroy {
    // charts data

    multi: any[] = [];

    // view: any[] = [700, 400];
    view: any[] = [undefined, undefined];
    // options
    showXAxis: boolean = true;
    showYAxis: boolean = true;
    showLegend: boolean = true;
    showXAxisLabel: boolean = true;
    xAxisLabel: string = 'Goals';
    showYAxisLabel: boolean = true;
    yAxisLabel: string = 'Budgets';
    legendTitle: string = 'Objectives';
    gradient: boolean = false;

    colorScheme = {
        domain: [
            '#a8385d',
            '#7aa3e5',
            '#a27ea8',
            '#aae3f5',
            '#adcded',
            '#a95963',
            '#8796c0',
            '#7ed3ed',
            '#50abcc',
            '#ad6886',
        ],
    };
    loading: boolean = false;
    private getDashboardSubscription = new Subject<void>();

    constructor(
        private goalService: GoalService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.getBarCharstData();
    }

    async getBarCharstData(campus: string = undefined) {
        this.loading = true;
        this.multi = [];
        this.goalService
            .fetch(
                'get',
                'goals',
                `getAllObjectivesWithObjectivesForBarChartsDashboard/${campus}`
            )
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe({
                next: (data: any) => {
                    this.multi = data.multi;
                    // this.changeDetectorRef.detectChanges();
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

    ngOnDestroy() {
        this.getDashboardSubscription.next();
        this.getDashboardSubscription.complete();
    }
}
