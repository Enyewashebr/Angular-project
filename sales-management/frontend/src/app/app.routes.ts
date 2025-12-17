import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  // Products routes
  {
    path: 'products',
    redirectTo: 'products/list',
    pathMatch: 'full'
  },
  {
    path: 'products/add',
    loadComponent: () =>
      import('./features/products/product-form/product-form.component')
        .then(m => m.ProductFormComponent)
  },
  {
    path: 'products/list',
    loadComponent: () =>
      import('./features/products/product-list/product-list.component')
        .then(m => m.ProductListComponent)
  },
  {
    path: 'products/edit/:id',
    loadComponent: () =>
      import('./features/products/product-form/product-form.component')
        .then(m => m.ProductFormComponent)
  },

  // Customers route
  {
    path: 'customers',
    redirectTo: 'customers/list',
    pathMatch: 'full'
  },
  {
    path: 'customers/list',
    loadComponent: () =>
      import('./features/customers/customer-list/customer-list.component')
        .then(m => m.CustomerListComponent)
  },
  {
    path: 'customers/add',
    loadComponent: () =>
      import('./features/customers/customer-form/customer-form.component')
        .then(m => m.CustomerFormComponent)
  },

  // Orders route
  {
    path: 'orders',
    redirectTo: 'orders/list',
    pathMatch: 'full'
  },
  {
    path: 'orders/list',
    loadComponent: () =>
      import('./features/orders/order-list/order-list.component')
        .then(m => m.OrderListComponent)
  },
  {
    path: 'orders/create',
    loadComponent: () =>
      import('./features/orders/order-create/order-create.component')
        .then(m => m.OrderCreateComponent)
  },
  {
    path: 'orders/details/:id',
    loadComponent: () =>
      import('./features/orders/order-details/order-details.component')
        .then(m => m.OrderDetailsComponent)
  },

  // Reports
  {
    path: 'reports',
    loadComponent: () =>
      import('./reports/reports.component')
        .then(m => m.ReportsComponent)
  },

  // Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./auth/signup/signup.component')
        .then(m => m.SignupComponent)
  }
];
