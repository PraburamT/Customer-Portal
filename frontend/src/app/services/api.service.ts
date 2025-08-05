import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) {}

  // Get customer ID from session
  private getCustomerId(): string {
    const customerId = this.sessionService.customerId;
    if (!customerId) {
      throw new Error('No customer ID found in session');
    }
    return customerId;
  }

  // Profile API
  getProfile(): Observable<any> {
    const customerId = this.getCustomerId();
    return this.http.post(`${this.baseUrl}/profile`, { customerId }, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // Dashboard API
  getDashboard(): Observable<any> {
    const customerId = this.getCustomerId();
    return this.http.post(`${this.baseUrl}/dashboard`, { customerId })
      .pipe(catchError(this.handleError));
  }

  // Sales Dashboard API
  getSalesDashboard(): Observable<any> {
    const customerId = this.getCustomerId();
    return this.http.post(`${this.baseUrl}/sales-dashboard`, { customerId })
      .pipe(catchError(this.handleError));
  }

  // List Dashboard API
  getListDashboard(): Observable<any> {
    const customerId = this.getCustomerId();
    return this.http.post(`${this.baseUrl}/list-dashboard`, { customerId })
      .pipe(catchError(this.handleError));
  }

  // Invoice Dashboard API
  getInvoiceDashboard(): Observable<any> {
    const customerId = this.getCustomerId();
    return this.http.post(`${this.baseUrl}/invoice-dashboard`, { customerId })
      .pipe(catchError(this.handleError));
  }

  // Payment Aging API
  getPaymentAging(): Observable<any> {
    const customerId = this.getCustomerId();
    return this.http.post(`${this.baseUrl}/payment-aging`, { customerId })
      .pipe(catchError(this.handleError));
  }

  // Credit/Debit Memo API
  getCreditDebit(): Observable<any> {
    const customerId = this.getCustomerId();
    return this.http.post(`${this.baseUrl}/credit-debit`, { customerId })
      .pipe(catchError(this.handleError));
  }

  // Invoice PDF API
  getInvoicePdf(docNo: string): Observable<Blob> {
    const customerId = this.getCustomerId();
    return this.http.post(`${this.baseUrl}/invoice-pdf`, { customerId, docNo }, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  // Overall Sales API
  getOverallSales(): Observable<any> {
    const customerId = this.getCustomerId();
    return this.http.post(`${this.baseUrl}/overall-sales`, { customerId })
      .pipe(catchError(this.handleError));
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errMsg = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errMsg = `Client error: ${error.error.message}`;
    } else if (error.error && typeof error.error === 'string') {
      // Server returned error message as string
      errMsg = error.error;
    } else if (error.error && error.error.error) {
      // Server returned error object
      errMsg = error.error.error;
    } else if (error.status) {
      // HTTP error status
      errMsg = `Server error: ${error.status} - ${error.statusText}`;
    }

    console.error('API Error:', error);
    return throwError(() => errMsg);
  }
} 