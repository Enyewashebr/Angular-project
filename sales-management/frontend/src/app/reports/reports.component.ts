import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { aggregateSalesByProduct, Order, OrderService, toDateKey, toMonthKey } from '../features/orders/order.service';

type ReportsMode = 'daily' | 'monthly';

type ReportsVm = {
  generatedAt: Date;
  mode: ReportsMode;
  dateKey: string;
  monthKey: string;
  orders: Order[];
  ordersCount: number;
  totalItems: number;
  totalSales: number;
  byProduct: ReturnType<typeof aggregateSalesByProduct>;
};

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  vm$: Observable<ReportsVm>;
  mode$ = new BehaviorSubject<ReportsMode>('daily');
  dateKey$ = new BehaviorSubject<string>(toDateKey(new Date()));
  monthKey$ = new BehaviorSubject<string>(toMonthKey(new Date()));

  constructor(private orders: OrderService) {
    this.vm$ = combineLatest([this.orders.getAll(), this.mode$, this.dateKey$, this.monthKey$]).pipe(
      map(([orders, mode, dateKey, monthKey]) => {
        const filtered =
          mode === 'daily'
            ? orders.filter(o => o.dateKey === dateKey)
            : orders.filter(o => o.monthKey === monthKey);

        const totalSales = filtered.reduce((sum, o) => sum + o.total, 0);
        const totalItems = filtered.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);

        return {
          generatedAt: new Date(),
          mode,
          dateKey,
          monthKey,
          orders: filtered,
          ordersCount: filtered.length,
          totalItems,
          totalSales,
          byProduct: aggregateSalesByProduct(filtered)
        };
      })
    );
  }

  setMode(mode: ReportsMode): void {
    this.mode$.next(mode);
  }

  setDateKey(dateKey: string): void {
    if (dateKey) this.dateKey$.next(dateKey);
  }

  setMonthKey(monthKey: string): void {
    if (monthKey) this.monthKey$.next(monthKey);
  }

  async downloadPdf(vm: ReportsVm): Promise<void> {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    doc.setFontSize(16);
    doc.text('Sales Report', 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${vm.generatedAt.toLocaleString()}`, 40, 58);

    doc.setFontSize(12);
    doc.text(`Mode: ${vm.mode === 'daily' ? `Daily (${vm.dateKey})` : `Monthly (${vm.monthKey})`}`, 40, 86);
    doc.text(`Orders: ${vm.ordersCount}`, 40, 104);
    doc.text(`Items Sold: ${vm.totalItems}`, 40, 122);
    doc.text(`Total Sales: $${vm.totalSales.toFixed(2)}`, 40, 140);

    autoTable(doc, {
      startY: 170,
      head: [['#', 'Product', 'Qty Sold', 'Revenue']],
      body: vm.byProduct.length
        ? vm.byProduct.map((r, idx) => [
            String(idx + 1),
            r.productName,
            String(r.quantity),
            `$${r.revenue.toFixed(2)}`
          ])
        : [['-', '-', '0', '$0.00']],
      styles: { fontSize: 9 }
    });

    const fileDate = new Date().toISOString().slice(0, 10);
    doc.save(`sales-report-${vm.mode}-${fileDate}.pdf`);
  }
}
