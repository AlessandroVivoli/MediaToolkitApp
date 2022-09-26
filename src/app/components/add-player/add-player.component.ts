import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PlayerModel } from 'src/app/models/player.model';
import { HttpService } from 'src/app/services/http.service';

@Component({
	selector: 'app-add-player',
	templateUrl: './add-player.component.html',
	styleUrls: ['./add-player.component.scss']
})
export class AddPlayerComponent implements OnInit {
	form: FormGroup;

	constructor(private http: HttpService) {}

	ngOnInit(): void {
		this.form = new FormGroup({
			name: new FormControl<string>('', [Validators.required])
		});
	}

	submit() {
		if (!this.form.invalid) {
			const sub = this.http.addPlayer(new PlayerModel(0, this.name, 0)).subscribe(() => sub.unsubscribe());
		}
	}

	get name() {
		return this.form.controls['name'].value;
	}
}
