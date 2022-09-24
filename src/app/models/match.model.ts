import { MatchPlayerModel } from "./match-player.model";

export interface MatchModel {
    id: number;
    players: MatchPlayerModel[];
    winner: string;
}