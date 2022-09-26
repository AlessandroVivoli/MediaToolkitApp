import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, NgControlStatus, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatchModel } from 'src/app/models/match.model';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
	selector: 'app-edit-match-dialog',
	templateUrl: './edit-match-dialog.component.html',
	styleUrls: ['./edit-match-dialog.component.scss']
})
export class EditMatchDialogComponent implements OnInit {
	form: FormGroup;
	private match: MatchModel;

	#sub: Subscription;

	constructor(@Inject(MAT_DIALOG_DATA) public data: MatchModel, private http: HttpService, private dataManager: DataManagerService) {
		this.match = data;
	}

	ngOnInit(): void {
		this.form = new FormGroup(
			{
				points_player0: new FormArray(
					[
						new FormControl<number>(this.data.players[0].points[0]),
						new FormControl<number>(this.data.players[0].points[1]),
						new FormControl<number>(this.data.players[0].points[2]),
						new FormControl<number>(this.data.players[0].points[3]),
						new FormControl<number>(this.data.players[0].points[4])
					],
					[Validators.required]
				),
				points_player1: new FormArray(
					[
						new FormControl<number>(this.data.players[1].points[0]),
						new FormControl<number>(this.data.players[1].points[1]),
						new FormControl<number>(this.data.players[1].points[2]),
						new FormControl<number>(this.data.players[1].points[3]),
						new FormControl<number>(this.data.players[1].points[4])
					],
					[Validators.required]
				),
				winner: new FormControl('Rick')
			},
			[this.validateMatch]
		);

		console.log(this.form.controls['winner']);
	}

	submit() {
		const points = [this.points(0).controls, this.points(1).controls];

		const pointsMapped = points.map((controls) => controls.map((control) => (control as FormControl<number>).value));

		if (!this.form.invalid)
			this.#sub = this.http
				.updateMatch({
					...this.data,
					players: [
						{ ...this.data.players[0], points: pointsMapped[0] },
						{ ...this.data.players[1], points: pointsMapped[1] }
					]
				} as MatchModel)
				.subscribe((match) => {
					this.dataManager.emit(match);
					this.data = match;
					this.#sub.unsubscribe();
				});
	}

	points(playerIndex): FormArray {
		return this.form.controls[`points_player${playerIndex}`] as FormArray;
	}

	getControlValue(controlName: string) {
		this.form.controls[controlName].value;
	}

	setValue(event: KeyboardEvent, playerIndex, elementIndex) {
		const control = (this.form.controls[`points_player${playerIndex}`] as FormArray).controls[elementIndex];

		const { key } = event;

		if (key === 'Backspace') {
			if (!Math.floor(control.value / 10)) {
				event.preventDefault();
				event.stopPropagation();

				control.setValue(0);
			}
		}

		if (key.match(/[1-9]/)) {
			if (control.value === 0) {
				event.preventDefault();
				event.stopPropagation();
				control.setValue(key);
			}
		}

		if (control.value === 0 && key === 'ArrowDown') {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	private validateMatch(control: FormGroup): ValidationErrors {
		const player1 = control.controls[`points_player0`] as FormArray;
		const player2 = control.controls['points_player1'] as FormArray;

		const player1Mapped = player1.controls.map((control, index) => {
			return (
				(control.value === 11 && !(player2.controls[index].value >= 10)) ||
				(control.value >= 10 && player2.controls[index].value === control.value - 2)
			);
		});
		const player2Mapped = player2.controls.map((control, index) => {
			return (
				(control.value === 11 && !(player1.controls[index].value >= 10)) ||
				(control.value >= 10 && player1.controls[index].value === control.value - 2)
			);
		});

		const validSets =
			player1Mapped.every((value, index) => value !== player2Mapped[index]) && player2Mapped.every((value, index) => value !== player1Mapped[index]);

		const player1Win =
			player1Mapped.reduce((prev, next) => {
				return next ? prev + 1 : prev;
			}, 0) === 3;
		const player2Win =
			player2Mapped.reduce((prev, next) => {
				return next ? prev + 1 : prev;
			}, 0) === 3;

		const validWinner = (player1Win && player1Mapped[player1Mapped.length - 1]) || (player2Win && player2Mapped[player2Mapped.length - 1]);

		return (player1Win || player2Win) && validSets && validWinner ? null : { invalidMatch: true };
	}
}
