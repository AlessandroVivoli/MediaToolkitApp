import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerInfoDialogComponent } from './player-info-dialog.component';

describe('PlayerDialogComponent', () => {
  let component: PlayerInfoDialogComponent;
  let fixture: ComponentFixture<PlayerInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerInfoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
