import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-overall-sales',
  imports: [CommonModule],
  templateUrl: './overall-sales.component.html',
  styleUrl: './overall-sales.component.css'
})
export class OverallSalesComponent implements OnInit {
  overallSales: any[] = [];
  loading = false;
  error: string | null = null;
  customerId: string | null = null;

  constructor(
    private apiService: ApiService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get customer ID from session
    this.sessionService.session$.subscribe(session => {
      if (session) {
        this.customerId = session.customerId;
        this.loadOverallSales();
      } else {
        this.router.navigate(['/login']);
      }
    });

    // Check if session is valid
    if (!this.sessionService.isSessionValid()) {
      this.router.navigate(['/login']);
    }
  }

  loadOverallSales(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getOverallSales().subscribe({
      next: (response) => {
        this.loading = false;
        if (response && response.overallSales) {
          this.overallSales = response.overallSales;
        } else {
          this.overallSales = [];
        }
        console.log('Overall sales data loaded:', this.overallSales);
      },
      error: (error) => {
        this.loading = false;
        this.error = error;
        console.error('Error loading overall sales:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  }
}
