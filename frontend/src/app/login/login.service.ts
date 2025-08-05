import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginUrl = 'http://localhost:8080/api/login';

  constructor(private http: HttpClient) {}

  login(customerId: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, { customerId, password }, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errMsg = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errMsg = `Client error: ${error.error.message}`;
    } else if (error.error && error.error.error) {
      errMsg = error.error.error;
    } else if (error.status) {
      errMsg = `Server error: ${error.status}`;
    }
    return throwError(() => errMsg);
  }
} 