import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectiveTableComponent } from './objective-table.component';

describe('ObjectiveTableComponent', () => {
  let component: ObjectiveTableComponent;
  let fixture: ComponentFixture<ObjectiveTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObjectiveTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObjectiveTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
