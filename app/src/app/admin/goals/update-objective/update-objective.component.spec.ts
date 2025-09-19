import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateObjectiveComponent } from './update-objective.component';

describe('UpdateObjectiveComponent', () => {
  let component: UpdateObjectiveComponent;
  let fixture: ComponentFixture<UpdateObjectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateObjectiveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateObjectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
