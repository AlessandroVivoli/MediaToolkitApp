import { MatchPlayerModel } from './match-player.model';

export class MatchModel {
	constructor(public id: number, public players: MatchPlayerModel[], public winner: string) {}
}
