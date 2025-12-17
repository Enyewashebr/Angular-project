import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Order, OrderService } from '../order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  orders$!: Observable<Order[]>;

  constructor(private orders: OrderService) {
    this.orders$ = this.orders.getAll();
  }

  deleteOrder(id: number): void {
    this.orders.delete(id);
  }
}
