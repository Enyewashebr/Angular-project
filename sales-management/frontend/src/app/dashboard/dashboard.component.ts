import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Chart, ArcElement, Legend, Tooltip } from 'chart.js';
import { map, Observable, Subscription } from 'rxjs';
import { aggregateSalesByProduct, OrderService, toDateKey, toMonthKey } from '../features/orders/order.service';

Chart.register(ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('topProductsChart') topProductsChart?: ElementRef<HTMLCanvasElement>;

  vm$!: Observable<{
    todayKey: string;
    monthKey: string;
    ordersToday: number;
    salesToday: number;
    ordersMonth: number;
    salesMonth: number;
    topProducts: Array<{ productName: string; quantity: number; revenue: number }>;
    chartLabels: string[];
    chartValues: number[];
  }>;

  private chart?: Chart;
  private sub = new Subscription();

  constructor(private orders: OrderService) {
    this.vm$ = this.orders.getAll().pipe(
      map(orders => {
        const todayKey = toDateKey(new Date());
        const monthKey = toMonthKey(new Date());

        const todayOrders = orders.filter(o => o.dateKey === todayKey);
        const monthOrders = orders.filter(o => o.monthKey === monthKey);

        const salesToday = todayOrders.reduce((s, o) => s + o.total, 0);
        const salesMonth = monthOrders.reduce((s, o) => s + o.total, 0);

        // Top products by quantity (this month)
        const rows = aggregateSalesByProduct(monthOrders).sort((a, b) => b.quantity - a.quantity);
        const top = rows.slice(0, 6);
        const restQty = rows.slice(6).reduce((s, r) => s + r.quantity, 0);

        const chartLabels = top.map(r => r.productName);
        const chartValues = top.map(r => r.quantity);
        if (restQty > 0) {
          chartLabels.push('Others');
          chartValues.push(restQty);
        }

        return {
          todayKey,
          monthKey,
          ordersToday: todayOrders.length,
          salesToday,
          ordersMonth: monthOrders.length,
          salesMonth,
          topProducts: top,
          chartLabels,
          chartValues
        };
      })
    );
  }

  ngAfterViewInit(): void {
    // Re-render chart whenever vm updates
    const s = this.vm$.subscribe(vm => this.renderChart(vm.chartLabels, vm.chartValues));
    this.sub.add(s);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.chart?.destroy();
  }

  private renderChart(labels: string[], values: number[]): void {
    const canvas = this.topProductsChart?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label: 'Qty Sold',
            data: values,
            backgroundColor: [
              '#4f46e5',
              '#3498db',
              '#22c55e',
              '#f59e0b',
              '#ef4444',
              '#14b8a6',
              '#94a3b8'
            ]
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
  }
}
