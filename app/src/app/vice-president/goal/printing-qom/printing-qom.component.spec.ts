import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintingQomComponent } from './printing-qom.component';

describe('PrintingQomComponent', () => {
  let component: PrintingQomComponent;
  let fixture: ComponentFixture<PrintingQomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintingQomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrintingQomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
