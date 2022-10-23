import { Component, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { MatchModel } from 'src/app/models/match.model';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { HttpService } from 'src/app/services/http.service';
import { DeleteMatchDialogComponent } from '../delete-match-dialog/delete-match-dialog.component';
import { EditMatchDialogComponent } from '../edit-match-dialog/edit-match-dialog.component';
import { MatchInfoDialogComponent } from '../match-info-dialog/match-info-dialog.component';

@Component({
	selector: 'app-match-list',
	templateUrl: './match-list.component.html',
	styleUrls: ['./match-list.component.scss'],
})
export class MatchListComponent implements OnInit, OnDestroy {
	@ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;

	@Output() menu: BehaviorSubject<MatMenuTrigger>;

	matches$: Observable<MatchModel[]>;
	menuTopLeftPosition = { x: '0', y: '0' };

	page: FormControl<number>;
	limit: FormControl<number>;

	matchSize: number;

	private matchArr: MatchModel[];
	private selectedMatch: MatchModel;

	#sub: Subscription;

	constructor(private httpService: HttpService, private dialog: MatDialog, private dataManager: DataManagerService) {
		this.#sub = new Subscription();

		this.page = new FormControl(0);
		this.limit = new FormControl(25);

		this.menu = new BehaviorSubject(this.matMenuTrigger);
	}

	ngOnInit(): void {
		this.matches$ = this.httpService.getAllMatches(this.page.value, this.limit.value);

		this.#sub.add(
			this.matches$.subscribe((matches) => {
				this.matchSize = matches.length;
				this.matchArr = matches;
			})
		);

		this.#sub.add(
			this.matMenuTrigger.menuOpened.subscribe(() => {
				this.menu.next(this.matMenuTrigger);
			})
		);

		this.#sub.add(
			this.dataManager.onMatchUpdate.subscribe((match) => {
				this.dialog.closeAll();

				this.matches$ = of(
					this.matchArr.map((oldMatch) => {
						if (oldMatch.id === match.id) return match;
						return oldMatch;
					})
				);
			})
		);
	}

	ngOnDestroy(): void {
		this.#sub.unsubscribe();
	}

	onRightClick(evt: MouseEvent, match: MatchModel) {
		this.selectedMatch = match;

		evt.preventDefault();
		evt.stopPropagation();

		this.menuTopLeftPosition.x = evt.clientX + 'px';
		this.menuTopLeftPosition.y = evt.clientY + 'px';
		this.matMenuTrigger.openMenu();
	}

	onLeftClick(match: MatchModel) {
		this.dialog.open(MatchInfoDialogComponent, {
			data: match,
			minWidth: 720,
		});
	}

	changePage(page: number) {
		this.page.setValue(page);

		this.matches$ = this.httpService.getAllMatches(this.page.value, this.limit.value);
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

	updateList({ key }: KeyboardEvent) {
		if (key === 'Enter') this.changePage(0);
	}

	editMatch() {
		this.dialog.open(EditMatchDialogComponent, {
			data: this.selectedMatch,
			minWidth: 720,
			maxWidth: 720,
		});
	}

	deleteMatch() {
		const sub = this.dialog
			.open(DeleteMatchDialogComponent, { data: this.selectedMatch })
			.afterClosed()
			.subscribe((answer) => {
				if (answer === 'Yes') {
					const deleteSub: Subscription = this.httpService.deleteMatch(this.selectedMatch.id).subscribe((value) => deleteSub.unsubscribe());

					this.matches$ = of(this.matchArr.filter((match) => match.id !== this.selectedMatch.id));
				}

				sub.unsubscribe();
			});
	}
}
