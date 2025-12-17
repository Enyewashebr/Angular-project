import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  createdAt: string; // ISO string
  dateKey: string; // local yyyy-mm-dd
  monthKey: string; // local yyyy-mm
  customerId: number;
  customerName: string;
  customerEmail?: string;
  items: OrderItem[];
  total: number;
}

export type OrderCreate = {
  customerId: number;
  customerName: string;
  customerEmail?: string;
  items: Array<{
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
  }>;
};

export type SalesByProductRow = {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
};

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function toMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function aggregateSalesByProduct(orders: Order[]): SalesByProductRow[] {
  const map = new Map<number, SalesByProductRow>();

  for (const o of orders) {
    for (const it of o.items) {
      const prev = map.get(it.productId);
      const revenue = it.unitPrice * it.quantity;
      if (!prev) {
        map.set(it.productId, {
          productId: it.productId,
          productName: it.productName,
          quantity: it.quantity,
          revenue
        });
      } else {
        prev.quantity += it.quantity;
        prev.revenue += revenue;
      }
    }
  }

  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly storageKey = 'sales_mgmt_orders_v1';
  private readonly orders$ = new BehaviorSubject<Order[]>(this.load());

  getAll(): Observable<Order[]> {
    return this.orders$.asObservable();
  }

  getCurrent(): Order[] {
    return this.orders$.getValue();
  }

  getById(id: number): Order | undefined {
    return this.orders$.getValue().find(o => o.id === id);
  }

  create(payload: OrderCreate): Order {
    const now = new Date();
    const current = this.orders$.getValue();
    const nextId = current.length ? Math.max(...current.map(o => o.id)) + 1 : 1;

    const items: OrderItem[] = payload.items
      .filter(i => i.quantity > 0)
      .map(i => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        lineTotal: i.unitPrice * i.quantity
      }));

    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

    const created: Order = {
      id: nextId,
      createdAt: now.toISOString(),
      dateKey: toDateKey(now),
      monthKey: toMonthKey(now),
      customerId: payload.customerId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      items,
      total
    };

    this.set([created, ...current]);
    return created;
  }

  delete(id: number): void {
    const current = this.orders$.getValue();
    this.set(current.filter(o => o.id !== id));
  }

  private set(orders: Order[]): void {
    this.orders$.next(orders);
    this.save(orders);
  }

  private load(): Order[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed as Order[];
    } catch {
      return [];
    }
  }

  private save(orders: Order[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(orders));
    } catch {
      // ignore storage quota / privacy errors
    }
  }
}


