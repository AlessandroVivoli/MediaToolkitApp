import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Observable, Subscription, BehaviorSubject, of } from 'rxjs';
import { PlayerModel } from 'src/app/models/player.model';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { HttpService } from 'src/app/services/http.service';
import { DeletePlayerDialogComponent } from '../delete-player-dialog/delete-player-dialog.component';
import { EditPlayerDialogComponent } from '../edit-player-dialog/edit-player-dialog.component';
import { PlayerInfoDialogComponent as PlayerInfoDialogComponent } from '../player-info-dialog/player-info-dialog.component';

@Component({
	selector: 'app-player-list',
	templateUrl: './player-list.component.html',
	styleUrls: ['./player-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default
})
export class PlayerListComponent implements OnInit, OnDestroy {
	@ViewChild(MatMenuTrigger, { static: true })
	private matMenuTrigger: MatMenuTrigger;

	@Output() menu: EventEmitter<MatMenuTrigger>;

	playerSize: number;
	players$: Observable<PlayerModel[]>;
	menuTopLeftPosition = { x: '0', y: '0' };

	page: FormControl<number>;
	limit: FormControl<number>;

	private playerArr: PlayerModel[];
	private selectedPlayer: PlayerModel;

	#sub: Subscription;

	constructor(private httpService: HttpService, private dialog: MatDialog, private dataManager: DataManagerService) {
		this.#sub = new Subscription();
		this.page = new FormControl(0);
		this.limit = new FormControl(25);

		this.menu = new EventEmitter();
	}

	ngOnInit(): void {
		this.players$ = this.httpService.getAllPlayers(this.page.value, this.limit.value);

		this.#sub.add(
			this.players$.subscribe((players) => {
				this.playerSize = players.length;
				this.playerArr = players;
			})
		);

		this.#sub.add(
			this.dataManager.onPlayerUpdate.subscribe((player) => {
				this.dialog.closeAll();

				this.players$ = of(
					this.playerArr.map((oldPlayer) => {
						if (player.id === oldPlayer.id) return player;
						return oldPlayer;
					})
				);
			})
		);

		this.#sub.add(
			this.dataManager.onMatchUpdate.subscribe(() => {
				this.players$ = this.httpService.getAllPlayers(this.page.value, this.limit.value);
			})
		)

		this.#sub.add(this.matMenuTrigger.menuOpened.subscribe(() => {
			this.menu.emit(this.matMenuTrigger);
		}))
	}

	ngOnDestroy(): void {
		this.#sub.unsubscribe();
	}

	changePage(pageNum: number) {
		this.page.setValue(pageNum);

		this.players$ = this.httpService.getAllPlayers(this.page.value, this.limit.value);
	}

	updateList({ key }: KeyboardEvent) {
		if (key === 'Enter') this.changePage(0);
	}

	updateLimitValue(event: KeyboardEvent) {
		if (event.key === 'Backspace') {
			if (!Math.floor(this.limit.value / 10)) {
				event.preventDefault();
				event.stopImmediatePropagation();

				this.limit.setValue(1);
			}
		} else if (event.key.match(/[0-9]+/g)) {
			if (event.key !== '0') {
				if (this.limit.value === 1) {
					event.preventDefault();
					event.stopPropagation();

					this.limit.setValue(Number.parseInt(event.key));
				}
			}
			if (Math.floor(this.limit.value / 100)) {
				event.preventDefault();
				event.stopPropagation();
			}
		} else {
			if (event.key === 'ArrowDown') {
				if (this.limit.value === 1) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}
	}

	onLeftClick(playerModel: PlayerModel) {
		this.dialog.open(PlayerInfoDialogComponent, {
			data: playerModel
		});
	}

	onRightClick(evt: MouseEvent, playerModel: PlayerModel) {
		this.selectedPlayer = playerModel;

		evt.preventDefault();
		evt.stopPropagation();

		this.menuTopLeftPosition.x = evt.clientX + 'px';
		this.menuTopLeftPosition.y = evt.clientY + 'px';
		this.matMenuTrigger.openMenu();
	}

	editPlayer() {
		this.dialog.open(EditPlayerDialogComponent, {
			data: this.selectedPlayer
		});
	}

	deletePlayer() {
		this.dialog
			.open(DeletePlayerDialogComponent, {
				data: this.selectedPlayer
			})
			.afterClosed()
			.subscribe((answer) => {
				switch (answer) {
					case 'Yes':
						this.players$ = this.httpService.deletePlayer(this.selectedPlayer.id);
						break;
				}
			});
	}
}
