import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddingGoalComponent } from './adding-goal.component';

describe('AddingGoalComponent', () => {
    let component: AddingGoalComponent;
    let fixture: ComponentFixture<AddingGoalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AddingGoalComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AddingGoalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
