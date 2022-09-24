import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerModel } from 'src/app/models/player.model';

@Component({
  selector: 'app-player-dialog',
  templateUrl: './player-dialog.component.html',
  styleUrls: ['./player-dialog.component.scss']
})
export class PlayerDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: PlayerModel) { }

  ngOnInit(): void {
  }

}
