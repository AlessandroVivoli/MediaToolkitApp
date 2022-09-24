import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { PlayerDialogComponent } from './components/player-dialog/player-dialog.component';

@NgModule({
	declarations: [AppComponent, PlayerDialogComponent],
	imports: [BrowserModule, BrowserAnimationsModule, MatCommonModule, HttpClientModule, MatSnackBarModule, MatDialogModule, ReactiveFormsModule],
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
