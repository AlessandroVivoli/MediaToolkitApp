import {
	HttpErrorResponse,
	HttpEvent,
	HttpEventType,
	HttpHandler,
	HttpInterceptor,
	HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, tap } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
	constructor(private snackBar: MatSnackBar) {}

	private snackOptions: MatSnackBarConfig = {
		duration: 5000,
		horizontalPosition: 'end',
		verticalPosition: 'top'
	};

	intercept(
		req: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			tap((data) => {
				if (data.type === HttpEventType.Response)
					switch (data.status) {
						case 200:
							this.snackBar.open('Success!', 'Ok', {
								...this.snackOptions,
								panelClass: 'success-snack'
							});
							break;
						case 400:
							this.snackBar.open('Invalid Request!', 'Ok', {
								...this.snackOptions,
								panelClass: 'warning-snack'
							});
							break;
						case 500:
							this.snackBar.open('An Error Occured!', 'Ok', {
								...this.snackOptions,
								panelClass: 'error-snack'
							});
							break;
					}
			})
		);
	}
}
