import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchInfoDialogComponent } from './match-info-dialog.component';

describe('MatchInfoDialogComponent', () => {
  let component: MatchInfoDialogComponent;
  let fixture: ComponentFixture<MatchInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchInfoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
