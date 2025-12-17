import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import Chart from 'chart.js/auto';
import { CustomerService } from '../features/customers/customer.service';
import { OrderService } from '../features/orders/order.service';
import { ProductService } from '../features/products/product.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('salesPie', { static: false }) salesPie?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private sub?: Subscription;

  vm$: Observable<{
    productsCount: number;
    customersCount: number;
    ordersCount: number;
    salesToday: number;
    salesThisMonth: number;
    topProducts: Array<{ name: string; qty: number }>;
  }>;

  constructor(
    private products: ProductService,
    private customers: CustomerService,
    private orders: OrderService
  ) {
    this.vm$ = combineLatest([this.products.getAll(), this.customers.getAll(), this.orders.getAll()]).pipe(
      map(([products, customers, orders]) => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = now.getMonth();
        const todayKey = now.toISOString().slice(0, 10);

        let salesToday = 0;
        let salesThisMonth = 0;

        const soldByProduct = new Map<number, number>();

        for (const o of orders) {
          const created = new Date(o.createdAt);
          const total = o.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
          if (created.toISOString().slice(0, 10) === todayKey) salesToday += total;
          if (created.getFullYear() === yyyy && created.getMonth() === mm) salesThisMonth += total;

          for (const it of o.items) {
            soldByProduct.set(it.productId, (soldByProduct.get(it.productId) ?? 0) + it.quantity);
          }
        }

        const topProducts = Array.from(soldByProduct.entries())
          .map(([productId, qty]) => ({
            name: products.find(p => p.id === productId)?.name ?? `Product #${productId}`,
            qty
          }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 6);

        return {
          productsCount: products.length,
          customersCount: customers.length,
          ordersCount: orders.length,
          salesToday,
          salesThisMonth,
          topProducts
        };
      })
    );
  }

  ngAfterViewInit(): void {
    // Build / update chart whenever vm changes
    this.sub = this.vm$.subscribe(vm => {
      const canvas = this.salesPie?.nativeElement;
      if (!canvas) return;

      const labels = vm.topProducts.map(p => p.name);
      const data = vm.topProducts.map(p => p.qty);

      if (!this.chart) {
        this.chart = new Chart(canvas, {
          type: 'pie',
          data: {
            labels,
            datasets: [
              {
                label: 'Most Sold Products (Qty)',
                data,
                backgroundColor: ['#4f46e5', '#3498db', '#1abc9c', '#f39c12', '#e74c3c', '#8e44ad']
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
        return;
      }

      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chart?.destroy();
  }
}
