import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintObjectiveTableComponent } from './print-objective-table.component';

describe('PrintObjectiveTableComponent', () => {
  let component: PrintObjectiveTableComponent;
  let fixture: ComponentFixture<PrintObjectiveTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintObjectiveTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrintObjectiveTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
