import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';

export interface InquiryItem {
  VBELN: string;
  ERDAT: string;
  MATNR: string;
  ARKTX: string;
  LFIMG: string;
  MEINS: string;
  WAERK: string;
  VRKME: string;
  KWMENG: string;
  NETWR: string;
}

export interface InquiryResponse {
  customerId: string;
  dashboard: InquiryItem[];
}

@Component({
  selector: 'app-inquiry-data',
  imports: [CommonModule],
  templateUrl: './inquiry-data.component.html',
  styleUrl: './inquiry-data.component.css'
})
export class InquiryDataComponent implements OnInit {
  customerId: string | null = null;
  inquiryData: InquiryItem[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  totalInquiries: number = 0;
  totalValue: number = 0;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Get customer ID from session
    this.customerId = this.sessionService.customerId;
    
    if (!this.customerId) {
      this.router.navigate(['/login']);
      return;
    }

    // Load inquiry data
    this.loadInquiryData();
  }

  loadInquiryData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getDashboard().subscribe({
      next: (response: InquiryResponse) => {
        this.isLoading = false;
        console.log('Inquiry data response:', response);
        
        if (response && response.dashboard) {
          this.inquiryData = response.dashboard;
          this.calculateTotals();
        } else {
          this.inquiryData = [];
          this.errorMessage = 'No inquiry data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
        console.error('Inquiry data loading error:', error);
      }
    });
  }

  private calculateTotals(): void {
    this.totalInquiries = this.inquiryData.length;
    this.totalValue = this.inquiryData.reduce((sum, item) => {
      const netwr = parseFloat(item.NETWR) || 0;
      return sum + netwr;
    }, 0);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: string): string {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'EUR'
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/login']);
  }

  refreshData(): void {
    this.loadInquiryData();
  }

  trackByVBELN(index: number, item: InquiryItem): string {
    return item.VBELN;
  }
} 