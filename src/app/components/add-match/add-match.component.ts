import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatchModel } from 'src/app/models/match.model';
import { PlayerModel } from 'src/app/models/player.model';
import { HttpService } from 'src/app/services/http.service';

@Component({
	selector: 'app-add-match',
	templateUrl: './add-match.component.html',
	styleUrls: ['./add-match.component.scss']
})
export class AddMatchComponent implements OnInit {
	form: FormGroup;

	players$: Observable<PlayerModel[]>;

	constructor(private http: HttpService) {}

	ngOnInit(): void {
		this.players$ = this.http.getAllPlayers(0, 1000);

		this.form = new FormGroup(
			{
				player1Points: new FormArray([
					new FormControl<number>(0),
					new FormControl<number>(0),
					new FormControl<number>(0),
					new FormControl<number>(0),
					new FormControl<number>(0)
				]),
				player2Points: new FormArray([
					new FormControl<number>(0),
					new FormControl<number>(0),
					new FormControl<number>(0),
					new FormControl<number>(0),
					new FormControl<number>(0)
				]),
				player1Selected: new FormControl<PlayerModel>(null, [Validators.required]),
				player2Selected: new FormControl<PlayerModel>(null, [Validators.required])
			},
			[this.validateMatch]
		);
	}

	submit() {
		if (!this.form.invalid) {
			const sub = this.http
				.addMatch(
					new MatchModel(
						0,
						[
							{ id: this.player1.id, name: this.player1.name, points: this.player1Points.map((control) => control.value) },
							{ id: this.player2.id, name: this.player2.name, points: this.player2Points.map((control) => control.value) }
						],
						this.player1.name
					)
				)
				.subscribe(() => sub.unsubscribe());
		}
	}

	get player1() {
		return (this.form.controls['player1Selected'] as FormControl<PlayerModel>).value;
	}
	get player2() {
		return (this.form.controls['player2Selected'] as FormControl<PlayerModel>).value;
	}

	get player1Points() {
		return (this.form.controls['player1Points'] as FormArray).controls;
	}

	get player2Points() {
		return (this.form.controls['player2Points'] as FormArray).controls;
	}

	private validateMatch(control: FormGroup): ValidationErrors {
		const player1 = control.controls[`player1Points`] as FormArray;
		const player2 = control.controls['player2Points'] as FormArray;

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

		console.log('Player 1');
		console.table(player1Mapped);

		console.log('Player 2');
		console.table(player2Mapped);

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
