import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePlayerDialogComponent } from './delete-player-dialog.component';

describe('DeletePlayerDialogComponent', () => {
  let component: DeletePlayerDialogComponent;
  let fixture: ComponentFixture<DeletePlayerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletePlayerDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletePlayerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
