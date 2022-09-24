import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { PlayerDialogComponent } from './components/player-dialog/player-dialog.component';
import { MatchModel } from './models/match.model';
import { PlayerModel } from './models/player.model';
import { HttpService } from './services/http.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
	title = 'mediatoolkit-assignment';

	playerSize: number;
	matchSize: number;

	players$: Observable<PlayerModel[]>;
	matches$: Observable<MatchModel[]>;

	playerPage: FormControl<any>;
	playerLimit: FormControl<any>;

	matchPage: FormControl<any>;
	matchLimit: FormControl<any>;

	#sub: Subscription;

	constructor(private httpService: HttpService, private dialog: MatDialog) {
		this.#sub = new Subscription();

		this.playerPage = new FormControl(0);
		this.playerLimit = new FormControl(25);

		this.matchPage = new FormControl(0);
		this.matchLimit = new FormControl(25);
	}

	ngOnInit(): void {
		this.players$ = this.httpService.getAllPlayers(this.playerPage.value, this.playerLimit.value);
		this.matches$ = this.httpService.getAllMatches(this.matchPage.value, this.matchLimit.value);

		this.#sub.add(this.players$.subscribe((players) => (this.playerSize = players.length)));
		this.#sub.add(this.matches$.subscribe((matches) => (this.matchSize = matches.length)));
	}

	ngOnDestroy(): void {
		this.#sub.unsubscribe();
	}

	changePlayerPage(pageNum: number) {
		this.playerPage.setValue(pageNum);

		this.players$ = this.httpService.getAllPlayers(this.playerPage.value, this.playerLimit.value);
	}

	updatePlayers({ key }: KeyboardEvent) {
		if (key === 'Enter') this.players$ = this.httpService.getAllPlayers(this.playerPage.value, this.playerLimit.value);
	}

	updatePlayerLimitValue(event: KeyboardEvent) {
		if (event.key === 'Backspace') {
			if (!Math.floor(this.playerLimit.value / 10)) {
				event.preventDefault();
				event.stopImmediatePropagation();

				this.playerLimit.setValue(1);
			}
		} else if (event.key.match(/[0-9]+/g)) {
			if (event.key !== '0') {
				if (this.playerLimit.value === 1) {
					event.preventDefault();
					event.stopImmediatePropagation();

					this.playerLimit.setValue(event.key);
				}
			}
			if (Math.floor(this.playerLimit.value / 100)) {
				event.preventDefault();
				event.stopImmediatePropagation();
			}
		} else {
			if (event.key === 'ArrowDown') {
				if (this.playerLimit.value === 1) {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			}
		}
	}

	onPlayerTableClick(playerModel: PlayerModel) {
		this.dialog.open(PlayerDialogComponent, {
			data: playerModel
		});
	}
}
