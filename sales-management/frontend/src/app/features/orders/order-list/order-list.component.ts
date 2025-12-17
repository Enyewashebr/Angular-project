import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { CustomerService } from '../../customers/customer.service';
import { Order, OrderService } from '../order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  vm$: Observable<{
    rows: Array<Order & { customerName: string; total: number }>;
    salesToday: number;
    salesThisMonth: number;
  }>;

  constructor(private orders: OrderService, private customers: CustomerService) {
    this.vm$ = combineLatest([this.orders.getAll(), this.customers.getAll()]).pipe(
      map(([orders, customers]) => {
        const now = new Date();
        const todayKey = now.toISOString().slice(0, 10);
        const yyyy = now.getFullYear();
        const mm = now.getMonth();

        let salesToday = 0;
        let salesThisMonth = 0;

        const rows = orders.map(o => {
          const customerName = customers.find(c => c.id === o.customerId)?.name ?? `Customer #${o.customerId}`;
          const total = o.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

          const created = new Date(o.createdAt);
          if (created.toISOString().slice(0, 10) === todayKey) salesToday += total;
          if (created.getFullYear() === yyyy && created.getMonth() === mm) salesThisMonth += total;

          return { ...o, customerName, total };
        });

        return { rows, salesToday, salesThisMonth };
      })
    );
  }

  delete(id: number): void {
    this.orders.delete(id);
  }
}
