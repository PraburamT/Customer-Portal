import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  customerId: string | null = null;
  loginTime: Date | null = null;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Subscribe to session changes
    this.sessionService.session$.subscribe(session => {
      if (session) {
        this.customerId = session.customerId;
        this.loginTime = session.loginTime;
      } else {
        // If no session, redirect to login
        this.router.navigate(['/login']);
      }
    });

    // Check if session is valid on component init
    if (!this.sessionService.isSessionValid()) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/login']);
  }

  // Navigation methods for different dashboard sections
  
  // Customer Dashboard Methods
  goToInquiryData(): void {
    this.router.navigate(['/inquiry-data']);
  }

  goToSalesOrderData(): void {
    this.router.navigate(['/sales-order-data']);
  }

  goToListDelivery(): void {
    this.router.navigate(['/list-delivery']);
  }

  // Financial Sheet Methods
  goToInvoiceDetails(): void {
    this.router.navigate(['/invoice-details']);
  }

  goToPaymentsAging(): void {
    this.router.navigate(['/payments-aging']);
  }

  goToCreditDebitMemo(): void {
    this.router.navigate(['/credit-debit-memo']);
  }

  goToOverallSalesData(): void {
    this.router.navigate(['/overall-sales']);
  }

  // Profile Method
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
} 