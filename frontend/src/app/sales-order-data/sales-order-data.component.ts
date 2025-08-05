import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';

export interface SalesOrderItem {
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

export interface SalesOrderResponse {
  customerId: string;
  salesDashboard: SalesOrderItem[];
}

@Component({
  selector: 'app-sales-order-data',
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-order-data.component.html',
  styleUrl: './sales-order-data.component.css'
})
export class SalesOrderDataComponent implements OnInit {
  customerId: string | null = null;
  salesOrderData: SalesOrderItem[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  totalOrders: number = 0;
  totalQuantity: number = 0;
  uniqueOrders: Set<string> = new Set();

  // Filter properties
  selectedCurrency: string = 'ALL';
  selectedMaterial: string = 'ALL';
  currencies: string[] = [];
  materials: string[] = [];

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

    // Load sales order data
    this.loadSalesOrderData();
  }

  loadSalesOrderData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getSalesDashboard().subscribe({
      next: (response: SalesOrderResponse) => {
        this.isLoading = false;
        console.log('Sales order data response:', response);
        
        if (response && response.salesDashboard) {
          this.salesOrderData = response.salesDashboard;
          this.calculateTotals();
          this.extractFilterOptions();
        } else {
          this.salesOrderData = [];
          this.errorMessage = 'No sales order data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
        console.error('Sales order data loading error:', error);
      }
    });
  }

  private calculateTotals(): void {
    this.uniqueOrders.clear();
    this.totalQuantity = 0;

    this.salesOrderData.forEach(item => {
      this.uniqueOrders.add(item.VBELN);
      this.totalQuantity += parseFloat(item.KWMENG) || 0;
    });

    this.totalOrders = this.uniqueOrders.size;
  }

  private extractFilterOptions(): void {
    // Extract unique currencies
    const currencySet = new Set<string>();
    const materialSet = new Set<string>();

    this.salesOrderData.forEach(item => {
      if (item.WAERK) currencySet.add(item.WAERK);
      if (item.ARKTX) materialSet.add(item.ARKTX);
    });

    this.currencies = ['ALL', ...Array.from(currencySet).sort()];
    this.materials = ['ALL', ...Array.from(materialSet).sort()];
  }

  get filteredData(): SalesOrderItem[] {
    return this.salesOrderData.filter(item => {
      const currencyMatch = this.selectedCurrency === 'ALL' || item.WAERK === this.selectedCurrency;
      const materialMatch = this.selectedMaterial === 'ALL' || item.ARKTX === this.selectedMaterial;
      return currencyMatch && materialMatch;
    });
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

  onCurrencyChange(): void {
    // Filter will be applied automatically through getter
  }

  onMaterialChange(): void {
    // Filter will be applied automatically through getter
  }

  clearFilters(): void {
    this.selectedCurrency = 'ALL';
    this.selectedMaterial = 'ALL';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/login']);
  }

  refreshData(): void {
    this.loadSalesOrderData();
  }

  trackByVBELN(index: number, item: SalesOrderItem): string {
    return item.VBELN;
  }
} 