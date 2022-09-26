import { AfterViewInit, Component } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
	title = 'mediatoolkit-assignment';
	private menu: MatMenuTrigger;

	constructor() {}

	ngAfterViewInit(): void {
		window.oncontextmenu = (evt) => {
			if (this.menu) {
				evt.preventDefault();
				evt.stopPropagation();

				this.menu.closeMenu();
				this.menu = null;
			}
		};
	}

	selectMenu(menu: MatMenuTrigger) {
		this.menu = menu;
	}
}
