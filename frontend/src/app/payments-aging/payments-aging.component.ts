import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';

export interface PaymentAgingItem {
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

export interface PaymentAgingResponse {
  customerId: string;
  paymentAging: PaymentAgingItem[];
}

@Component({
  selector: 'app-payments-aging',
  imports: [CommonModule, FormsModule],
  templateUrl: './payments-aging.component.html',
  styleUrl: './payments-aging.component.css'
})
export class PaymentsAgingComponent implements OnInit {
  customerId: string | null = null;
  paymentAgingData: PaymentAgingItem[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  totalPayments: number = 0;
  totalAmount: number = 0;
  uniquePayments: Set<string> = new Set();

  // Filter properties
  selectedCurrency: string = 'ALL';
  currencies: string[] = [];

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

    // Load payment aging data
    this.loadPaymentAgingData();
  }

  loadPaymentAgingData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getPaymentAging().subscribe({
      next: (response: PaymentAgingResponse) => {
        this.isLoading = false;
        console.log('Payment aging data response:', response);
        
        if (response && response.paymentAging) {
          this.paymentAgingData = response.paymentAging;
          this.calculateTotals();
          this.extractFilterOptions();
        } else {
          this.paymentAgingData = [];
          this.errorMessage = 'No payment aging data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
        console.error('Payment aging data loading error:', error);
      }
    });
  }

  private calculateTotals(): void {
    this.uniquePayments.clear();
    this.totalAmount = 0;

    this.paymentAgingData.forEach(item => {
      this.uniquePayments.add(item.VBELN);
      this.totalAmount += parseFloat(item.NETWR) || 0;
    });

    this.totalPayments = this.uniquePayments.size;
  }

  private extractFilterOptions(): void {
    // Extract unique currencies
    const currencySet = new Set<string>();

    this.paymentAgingData.forEach(item => {
      if (item.WAERK) currencySet.add(item.WAERK);
    });

    this.currencies = ['ALL', ...Array.from(currencySet).sort()];
  }

  get filteredData(): PaymentAgingItem[] {
    return this.paymentAgingData.filter(item => {
      const currencyMatch = this.selectedCurrency === 'ALL' || item.WAERK === this.selectedCurrency;
      return currencyMatch;
    });
  }

  get filteredTotalAmount(): number {
    return this.filteredData.reduce((sum, item) => sum + (parseFloat(item.NETWR) || 0), 0);
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
    if (!amount || amount === '') return 'N/A';
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'EUR'
    });
  }

  formatCurrencyWithSymbol(amount: string, currency: string): string {
    if (!amount || amount === '') return 'N/A';
    const num = parseFloat(amount) || 0;
    
    // Map currency codes to symbols
    const currencySymbols: { [key: string]: string } = {
      'EUR': '€',
      'USD': '$',
      'INR': '₹'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  onCurrencyChange(): void {
    // Filter will be applied automatically through getter
  }

  clearFilters(): void {
    this.selectedCurrency = 'ALL';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/login']);
  }

  refreshData(): void {
    this.loadPaymentAgingData();
  }

  trackByVBELN(index: number, item: PaymentAgingItem): string {
    return item.VBELN;
  }
} 