import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';
import { SafePipe } from '../pipes/safe.pipe';

export interface InvoiceItem {
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

export interface InvoiceResponse {
  customerId: string;
  invoiceDashboard: InvoiceItem[];
}

@Component({
  selector: 'app-invoice-details',
  imports: [CommonModule, FormsModule, SafePipe],
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.css'
})
export class InvoiceDetailsComponent implements OnInit {
  customerId: string | null = null;
  invoiceData: InvoiceItem[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  totalInvoices: number = 0;
  totalAmount: number = 0;
  uniqueInvoices: Set<string> = new Set();

  // Filter properties
  selectedCurrency: string = 'ALL';
  currencies: string[] = [];

  // PDF properties
  showPdfPreview: boolean = false;
  pdfUrl: string = '';
  selectedInvoice: InvoiceItem | null = null;
  isPdfLoading: boolean = false;

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

    // Load invoice data
    this.loadInvoiceData();
  }

  loadInvoiceData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getInvoiceDashboard().subscribe({
      next: (response: InvoiceResponse) => {
        this.isLoading = false;
        console.log('Invoice data response:', response);
        
        if (response && response.invoiceDashboard) {
          this.invoiceData = response.invoiceDashboard;
          this.calculateTotals();
          this.extractFilterOptions();
        } else {
          this.invoiceData = [];
          this.errorMessage = 'No invoice data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
        console.error('Invoice data loading error:', error);
      }
    });
  }

  private calculateTotals(): void {
    this.uniqueInvoices.clear();
    this.totalAmount = 0;

    this.invoiceData.forEach(item => {
      this.uniqueInvoices.add(item.VBELN);
      this.totalAmount += parseFloat(item.NETWR) || 0;
    });

    this.totalInvoices = this.uniqueInvoices.size;
  }

  private extractFilterOptions(): void {
    // Extract unique currencies
    const currencySet = new Set<string>();

    this.invoiceData.forEach(item => {
      if (item.WAERK) currencySet.add(item.WAERK);
    });

    this.currencies = ['ALL', ...Array.from(currencySet).sort()];
  }

  get filteredData(): InvoiceItem[] {
    return this.invoiceData.filter(item => {
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

  // PDF Functions
  previewPdf(invoice: InvoiceItem): void {
    this.selectedInvoice = invoice;
    this.isPdfLoading = true;
    this.showPdfPreview = true;

    this.apiService.getInvoicePdf(invoice.VBELN).subscribe({
      next: (response: Blob) => {
        this.isPdfLoading = false;
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfUrl = URL.createObjectURL(blob);
      },
      error: (error) => {
        this.isPdfLoading = false;
        console.error('PDF preview error:', error);
        alert('Error loading PDF preview: ' + error);
      }
    });
  }

  downloadPdf(invoice: InvoiceItem): void {
    this.isPdfLoading = true;

    this.apiService.getInvoicePdf(invoice.VBELN).subscribe({
      next: (response: Blob) => {
        this.isPdfLoading = false;
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoice.VBELN}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.isPdfLoading = false;
        console.error('PDF download error:', error);
        alert('Error downloading PDF: ' + error);
      }
    });
  }

  closePdfPreview(): void {
    this.showPdfPreview = false;
    this.selectedInvoice = null;
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = '';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/login']);
  }

  refreshData(): void {
    this.loadInvoiceData();
  }

  trackByVBELN(index: number, item: InvoiceItem): string {
    return item.VBELN;
  }
} 