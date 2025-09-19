import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintGoalComponent } from './print-goal.component';

describe('PrintGoalComponent', () => {
  let component: PrintGoalComponent;
  let fixture: ComponentFixture<PrintGoalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintGoalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrintGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
