import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintQomComponent } from './print-qom.component';

describe('PrintQomComponent', () => {
  let component: PrintQomComponent;
  let fixture: ComponentFixture<PrintQomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintQomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrintQomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
