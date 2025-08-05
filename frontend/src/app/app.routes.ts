import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { InquiryDataComponent } from './inquiry-data/inquiry-data.component';
import { SalesOrderDataComponent } from './sales-order-data/sales-order-data.component';
import { ListDeliveryComponent } from './list-delivery/list-delivery.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { PaymentsAgingComponent } from './payments-aging/payments-aging.component';
import { CreditDebitMemoComponent } from './credit-debit-memo/credit-debit-memo.component';
import { OverallSalesComponent } from './overall-sales/overall-sales.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'inquiry-data', 
    component: InquiryDataComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'sales-order-data', 
    component: SalesOrderDataComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'list-delivery', 
    component: ListDeliveryComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'invoice-details', 
    component: InvoiceDetailsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'payments-aging', 
    component: PaymentsAgingComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'credit-debit-memo', 
    component: CreditDebitMemoComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'overall-sales', 
    component: OverallSalesComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
