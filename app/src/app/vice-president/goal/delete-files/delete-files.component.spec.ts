import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteFilesComponent } from './delete-files.component';

describe('DeleteFilesComponent', () => {
  let component: DeleteFilesComponent;
  let fixture: ComponentFixture<DeleteFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteFilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
