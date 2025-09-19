import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalDashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
    let component: GoalDashboardComponent;
    let fixture: ComponentFixture<GoalDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GoalDashboardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GoalDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
