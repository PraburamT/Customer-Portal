import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';

export interface CreditDebitItem {
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

export interface CreditDebitResponse {
  customerId: string;
  creditDebitData: CreditDebitItem[];
}

@Component({
  selector: 'app-credit-debit-memo',
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-debit-memo.component.html',
  styleUrl: './credit-debit-memo.component.css'
})
export class CreditDebitMemoComponent implements OnInit {
  customerId: string | null = null;
  creditDebitData: CreditDebitItem[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  totalMemos: number = 0;
  totalAmount: number = 0;
  uniqueMemos: Set<string> = new Set();

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

    // Load credit/debit memo data
    this.loadCreditDebitData();
  }

  loadCreditDebitData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getCreditDebit().subscribe({
      next: (response: CreditDebitResponse) => {
        this.isLoading = false;
        console.log('Credit/Debit memo data response:', response);
        
        if (response && response.creditDebitData) {
          this.creditDebitData = response.creditDebitData;
          this.calculateTotals();
          this.extractFilterOptions();
        } else {
          this.creditDebitData = [];
          this.errorMessage = 'No credit/debit memo data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
        console.error('Credit/Debit memo data loading error:', error);
      }
    });
  }

  private calculateTotals(): void {
    this.uniqueMemos.clear();
    this.totalAmount = 0;

    this.creditDebitData.forEach(item => {
      this.uniqueMemos.add(item.VBELN);
      this.totalAmount += parseFloat(item.NETWR) || 0;
    });

    this.totalMemos = this.uniqueMemos.size;
  }

  private extractFilterOptions(): void {
    // Extract unique currencies
    const currencySet = new Set<string>();

    this.creditDebitData.forEach(item => {
      if (item.WAERK) currencySet.add(item.WAERK);
    });

    this.currencies = ['ALL', ...Array.from(currencySet).sort()];
  }

  get filteredData(): CreditDebitItem[] {
    return this.creditDebitData.filter(item => {
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
    this.loadCreditDebitData();
  }

  trackByVBELN(index: number, item: CreditDebitItem): string {
    return item.VBELN;
  }
} 