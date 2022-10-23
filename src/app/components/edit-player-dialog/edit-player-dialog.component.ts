import { Component, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PlayerModel } from 'src/app/models/player.model';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
	selector: 'app-edit-player-dialog',
	templateUrl: './edit-player-dialog.component.html',
	styleUrls: ['./edit-player-dialog.component.scss'],
})
export class EditPlayerDialogComponent implements OnInit {
	form: FormGroup;
	#sub: Subscription;

	@Output() onPlayerUpdate: BehaviorSubject<PlayerModel>;

	constructor(@Inject(MAT_DIALOG_DATA) public data: PlayerModel, private httpService: HttpService, private dataManager: DataManagerService) {
		this.onPlayerUpdate = new BehaviorSubject(data);
	}

	ngOnInit(): void {
		this.form = new FormGroup({
			name: new FormControl(this.data.name, {
				validators: [
					Validators.required,
					(control) => {
						const invalid = control.value === this.data.name;
						return invalid ? { invalidName: { value: control.value } } : null;
					},
					Validators.maxLength(12),
				],
			}),
		});
	}

	submit() {
		if (!this.form.invalid)
			this.#sub = this.httpService.updatePlayer({ ...this.data, name: this.form.get('name').value } as PlayerModel).subscribe((player) => {
				this.dataManager.emit(player);
				this.data = player;
				this.#sub.unsubscribe();
			});
	}
}
