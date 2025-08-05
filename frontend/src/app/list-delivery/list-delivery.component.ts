import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';

export interface DeliveryItem {
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

export interface DeliveryResponse {
  customerId: string;
  listDashboard: DeliveryItem[];
}

@Component({
  selector: 'app-list-delivery',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-delivery.component.html',
  styleUrl: './list-delivery.component.css'
})
export class ListDeliveryComponent implements OnInit {
  customerId: string | null = null;
  deliveryData: DeliveryItem[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  totalDeliveries: number = 0;
  totalQuantity: number = 0;
  uniqueDeliveries: Set<string> = new Set();

  // Filter properties
  selectedMaterial: string = 'ALL';
  selectedUnit: string = 'ALL';
  materials: string[] = [];
  units: string[] = [];

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

    // Load delivery data
    this.loadDeliveryData();
  }

  loadDeliveryData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getListDashboard().subscribe({
      next: (response: DeliveryResponse) => {
        this.isLoading = false;
        console.log('Delivery data response:', response);
        
        if (response && response.listDashboard) {
          // Filter out empty records
          this.deliveryData = response.listDashboard.filter(item => 
            item.MATNR && item.MATNR.trim() !== '' && 
            item.ARKTX && item.ARKTX.trim() !== ''
          );
          this.calculateTotals();
          this.extractFilterOptions();
        } else {
          this.deliveryData = [];
          this.errorMessage = 'No delivery data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
        console.error('Delivery data loading error:', error);
      }
    });
  }

  private calculateTotals(): void {
    this.uniqueDeliveries.clear();
    this.totalQuantity = 0;

    this.deliveryData.forEach(item => {
      this.uniqueDeliveries.add(item.VBELN);
      this.totalQuantity += parseFloat(item.LFIMG) || 0;
    });

    this.totalDeliveries = this.uniqueDeliveries.size;
  }

  private extractFilterOptions(): void {
    // Extract unique materials and units
    const materialSet = new Set<string>();
    const unitSet = new Set<string>();

    this.deliveryData.forEach(item => {
      if (item.ARKTX) materialSet.add(item.ARKTX);
      if (item.MEINS) unitSet.add(item.MEINS);
    });

    this.materials = ['ALL', ...Array.from(materialSet).sort()];
    this.units = ['ALL', ...Array.from(unitSet).sort()];
  }

  get filteredData(): DeliveryItem[] {
    return this.deliveryData.filter(item => {
      const materialMatch = this.selectedMaterial === 'ALL' || item.ARKTX === this.selectedMaterial;
      const unitMatch = this.selectedUnit === 'ALL' || item.MEINS === this.selectedUnit;
      return materialMatch && unitMatch;
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

  formatQuantity(quantity: string): string {
    if (!quantity || quantity === '') return 'N/A';
    const num = parseFloat(quantity) || 0;
    return num.toFixed(1);
  }

  onMaterialChange(): void {
    // Filter will be applied automatically through getter
  }

  onUnitChange(): void {
    // Filter will be applied automatically through getter
  }

  clearFilters(): void {
    this.selectedMaterial = 'ALL';
    this.selectedUnit = 'ALL';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/login']);
  }

  refreshData(): void {
    this.loadDeliveryData();
  }

  trackByVBELN(index: number, item: DeliveryItem): string {
    return item.VBELN;
  }
} 