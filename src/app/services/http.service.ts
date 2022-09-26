import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
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
		return this.http.post<any>('/api/players', player);
	}

	public updatePlayer(player: PlayerModel): Observable<PlayerModel> {
		return this.http.put<PlayerModel>(`/api/players/${player.id}`, player).pipe(
			map((value) => {
				return new PlayerModel(value.id, value.name, value.setsWon);
			})
		);
	}

	public deletePlayer(id: number): Observable<PlayerModel[]> {
		return this.http.delete<PlayerModel[]>(`/api/players/${id}`);
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
		return this.http.post<string>('/api/matches', match);
	}

	public updateMatch(match: MatchModel): Observable<MatchModel> {
		return this.http.put<MatchModel>(`/api/matches/${match.id}`, match);
	}

	public deleteMatch(id: number) {
		return this.http.delete<any>(`/api/matches/${id}`);
	}
}
