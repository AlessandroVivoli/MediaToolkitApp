import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatchModel } from 'src/app/models/match.model';

@Component({
  selector: 'app-delete-match-dialog',
  templateUrl: './delete-match-dialog.component.html',
  styleUrls: ['./delete-match-dialog.component.scss']
})
export class DeleteMatchDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: MatchModel) { }

}
