import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFileHistoryComponent } from './view-file-history.component';

describe('ViewFileHistoryComponent', () => {
  let component: ViewFileHistoryComponent;
  let fixture: ComponentFixture<ViewFileHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFileHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewFileHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
