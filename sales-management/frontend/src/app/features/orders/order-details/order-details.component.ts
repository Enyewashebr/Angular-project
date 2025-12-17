import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { CustomerService } from '../../customers/customer.service';
import { ProductService } from '../../products/product.service';
import { Order, OrderService } from '../order.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {
  id: number;
  vm$: Observable<{
    order?: Order;
    customerName?: string;
    createdAt?: string;
    items: Array<{ productName: string; quantity: number; unitPrice: number; lineTotal: number }>;
    total: number;
  }>;

  constructor(
    route: ActivatedRoute,
    orders: OrderService,
    customers: CustomerService,
    products: ProductService
  ) {
    this.id = Number(route.snapshot.paramMap.get('id'));

    this.vm$ = combineLatest([orders.getAll(), customers.getAll(), products.getAll()]).pipe(
      map(([ordersList, customersList, productsList]) => {
        const order = ordersList.find(o => o.id === this.id);
        if (!order) return { items: [], total: 0 };

        const customerName = customersList.find(c => c.id === order.customerId)?.name ?? `Customer #${order.customerId}`;
        const items = order.items.map(it => {
          const productName = productsList.find(p => p.id === it.productId)?.name ?? `Product #${it.productId}`;
          const lineTotal = it.quantity * it.unitPrice;
          return { productName, quantity: it.quantity, unitPrice: it.unitPrice, lineTotal };
        });
        const total = items.reduce((sum, it) => sum + it.lineTotal, 0);

        return { order, customerName, createdAt: order.createdAt, items, total };
      })
    );
  }
}
