import { EventEmitter, Injectable, Output } from '@angular/core';
import { MatchModel } from '../models/match.model';
import { PlayerModel } from '../models/player.model';

@Injectable({
	providedIn: 'root'
})
export class DataManagerService {
	@Output() onPlayerUpdate: EventEmitter<PlayerModel>;
	@Output() onMatchUpdate: EventEmitter<MatchModel>;

	constructor() {
    this.onPlayerUpdate = new EventEmitter();
    this.onMatchUpdate = new EventEmitter();
  }

	emit(data: PlayerModel | MatchModel) {
		if (data instanceof PlayerModel) this.onPlayerUpdate.emit(data);
		else this.onMatchUpdate.emit(data);
	}
}
