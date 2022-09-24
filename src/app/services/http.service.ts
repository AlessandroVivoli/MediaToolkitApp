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
		return this.http.get<PlayerModel[]>('/api/players', {
			params: { page: page, limit: limit }
		});
	}

	public getPlayerById(id: number): Observable<PlayerModel> {
		return this.http.get<PlayerModel>(`/api/players/${id}`);
	}

	public addPlayer(player: PlayerModel) {
		this.http.post('/api/players', player);
	}

	public updatePlayer(player: PlayerModel) {
		this.http.put(`/api/players/${player.id}`, player);
	}

	public deletePlayer(id: number) {
		this.http.delete(`/api/players/${id}`);
	}

	public getAllMatches(page: number, limit: number): Observable<MatchModel[]> {
		return this.http.get<MatchModel[]>('/api/matches', {
			params: { page: page, limit: limit }
		});
	}

	public getMatchById(id: number): Observable<MatchModel> {
		return this.http.get<MatchModel>(`/api/matches/${id}`);
	}

	public addMatch(match: MatchModel) {
		this.http.post('/api/matches', match);
	}

	public updateMatch(match: MatchModel) {
		this.http.put(`/api/matches/${match.id}`, match);
	}

	public deleteMatch(id: number) {
		this.http.delete(`/api/matches/${id}`);
	}
}
