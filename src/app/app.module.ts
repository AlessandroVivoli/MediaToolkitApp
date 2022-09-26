import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { MatchListComponent } from './components/match-list/match-list.component';
import { PlayerInfoDialogComponent } from './components/player-info-dialog/player-info-dialog.component';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { EditPlayerDialogComponent } from './components/edit-player-dialog/edit-player-dialog.component';
import { DeletePlayerDialogComponent } from './components/delete-player-dialog/delete-player-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatchInfoDialogComponent } from './components/match-info-dialog/match-info-dialog.component';
import { EditMatchDialogComponent } from './components/edit-match-dialog/edit-match-dialog.component';
import { DeleteMatchDialogComponent } from './components/delete-match-dialog/delete-match-dialog.component';
import { LabelControlDirective } from './directives/label-control.directive';
import { AddPlayerComponent } from './components/add-player/add-player.component';
import { AddMatchComponent } from './components/add-match/add-match.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
@NgModule({
	declarations: [
		AppComponent,
		PlayerInfoDialogComponent,
		PlayerListComponent,
		MatchListComponent,
		EditPlayerDialogComponent,
		DeletePlayerDialogComponent,
		MatchInfoDialogComponent,
		EditMatchDialogComponent,
		DeleteMatchDialogComponent,
		LabelControlDirective,
		AddPlayerComponent,
		AddMatchComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MatCommonModule,
		HttpClientModule,
		MatSnackBarModule,
		MatDialogModule,
		ReactiveFormsModule,
		MatMenuModule,
		MatIconModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: HttpInterceptorService,
			multi: true
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
