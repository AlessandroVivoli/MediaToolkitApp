import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMatchDialogComponent } from './delete-match-dialog.component';

describe('DeleteMatchDialogComponent', () => {
  let component: DeleteMatchDialogComponent;
  let fixture: ComponentFixture<DeleteMatchDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteMatchDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteMatchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
