import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerModel } from 'src/app/models/player.model';

@Component({
	selector: 'app-delete-player-dialog',
	templateUrl: './delete-player-dialog.component.html',
	styleUrls: ['./delete-player-dialog.component.scss']
})
export class DeletePlayerDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: PlayerModel) {}
}
