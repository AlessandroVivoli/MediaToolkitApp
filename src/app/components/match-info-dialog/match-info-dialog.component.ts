import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatchModel } from 'src/app/models/match.model';

@Component({
	selector: 'app-match-info-dialog',
	templateUrl: './match-info-dialog.component.html',
	styleUrls: ['./match-info-dialog.component.scss']
})
export class MatchInfoDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: MatchModel) {}
}
