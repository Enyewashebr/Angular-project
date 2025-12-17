import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ProductService } from '../features/products/product.service';
import { OrderService } from '../features/orders/order.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  vm$: Observable<{
    totalToday: number;
    totalThisMonth: number;
    totalThisYear: number;
    daily: Array<{ day: string; total: number; orders: number }>;
    monthly: Array<{ month: string; total: number; orders: number }>;
    topProducts: Array<{ productName: string; qty: number; revenue: number }>;
  }>;

  constructor(private orders: OrderService, private products: ProductService) {
    this.vm$ = combineLatest([this.orders.getAll(), this.products.getAll()]).pipe(
      map(([orders, products]) => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = now.getMonth(); // 0-based

        const orderTotal = (o: { items: Array<{ quantity: number; unitPrice: number }> }) =>
          o.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

        const dayKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
        const monthKey = (d: Date) => d.toISOString().slice(0, 7); // YYYY-MM

        // totals
        let totalToday = 0;
        let totalThisMonth = 0;
        let totalThisYear = 0;

        const todayKey = dayKey(now);
        const dailyMap = new Map<string, { total: number; orders: number }>();
        const monthlyMap = new Map<string, { total: number; orders: number }>();
        const productAgg = new Map<number, { qty: number; revenue: number }>();

        for (const o of orders) {
          const created = new Date(o.createdAt);
          const total = orderTotal(o);

          // totals
          if (dayKey(created) === todayKey) totalToday += total;
          if (created.getFullYear() === yyyy) totalThisYear += total;
          if (created.getFullYear() === yyyy && created.getMonth() === mm) totalThisMonth += total;

          // daily (current month only)
          if (created.getFullYear() === yyyy && created.getMonth() === mm) {
            const key = dayKey(created);
            const cur = dailyMap.get(key) ?? { total: 0, orders: 0 };
            dailyMap.set(key, { total: cur.total + total, orders: cur.orders + 1 });
          }

          // monthly (current year only)
          if (created.getFullYear() === yyyy) {
            const key = monthKey(created);
            const cur = monthlyMap.get(key) ?? { total: 0, orders: 0 };
            monthlyMap.set(key, { total: cur.total + total, orders: cur.orders + 1 });
          }

          // top products
          for (const it of o.items) {
            const cur = productAgg.get(it.productId) ?? { qty: 0, revenue: 0 };
            productAgg.set(it.productId, {
              qty: cur.qty + it.quantity,
              revenue: cur.revenue + it.quantity * it.unitPrice
            });
          }
        }

        const daily = Array.from(dailyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([day, v]) => ({ day, total: v.total, orders: v.orders }));

        const monthly = Array.from(monthlyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, v]) => ({ month, total: v.total, orders: v.orders }));

        const topProducts = Array.from(productAgg.entries())
          .map(([productId, v]) => ({
            productName: products.find(p => p.id === productId)?.name ?? `Product #${productId}`,
            qty: v.qty,
            revenue: v.revenue
          }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 8);

        return {
          totalToday,
          totalThisMonth,
          totalThisYear,
          daily,
          monthly,
          topProducts
        };
      })
    );
  }
}




