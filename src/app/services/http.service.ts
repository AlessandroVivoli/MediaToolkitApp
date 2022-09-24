import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchModel } from '../models/match.model';
import { PlayerModel } from '../models/player.model';

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	constructor(private http: HttpClient) {}

	public getAllPlayers(page: number, limit: number): Observable<PlayerModel[]> {
		return this.http.get<PlayerModel[]>('/players', {
			params: { page: page, limit: limit }
		});
	}

	public getPlayerById(id: number): Observable<PlayerModel> {
		return this.http.get<PlayerModel>(`/players/${id}`);
	}

	public addPlayer(player: PlayerModel) {
		this.http.post('/players', player);
	}

	public updatePlayer(player: PlayerModel) {
		this.http.put(`/players/${player.id}`, player);
	}

	public deletePlayer(id: number) {
		this.http.delete(`/players/${id}`);
	}

	public getAllMatches(page: number, limit: number): Observable<MatchModel[]> {
		return this.http.get<MatchModel[]>('/matches', {
			params: { page: page, limit: limit }
		});
	}

	public getMatchById(id: number): Observable<MatchModel> {
		return this.http.get<MatchModel>(`/matches/${id}`);
	}

	public addMatch(match: MatchModel) {
		this.http.post('/matches', match);
	}

	public updateMatch(match: MatchModel) {
		this.http.put(`/matches/${match.id}`, match);
	}

	public deleteMatch(id: number) {
		this.http.delete(`/matches/${id}`);
	}
}
