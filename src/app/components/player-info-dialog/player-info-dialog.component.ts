import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerModel } from 'src/app/models/player.model';

@Component({
  selector: 'app-player-dialog',
  templateUrl: './player-info-dialog.component.html',
  styleUrls: ['./player-info-dialog.component.scss']
})
export class PlayerInfoDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: PlayerModel) { }

  ngOnInit(): void {
  }

}
