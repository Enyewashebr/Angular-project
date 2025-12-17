import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { Order, OrderService } from '../order.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {
  order$!: Observable<Order | undefined>;

  constructor(
    private route: ActivatedRoute,
    private orders: OrderService
  ) {
    const id$ = this.route.paramMap.pipe(map(p => Number(p.get('id'))));
    this.order$ = combineLatest([id$, this.orders.getAll()]).pipe(
      map(([id, orders]) => orders.find(o => o.id === id))
    );
  }
}
