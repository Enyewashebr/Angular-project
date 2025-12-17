import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductService } from '../products/product.service';

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  customerId: number;
  createdAt: string; // ISO string
  items: OrderItem[];
}

const STORAGE_KEY = 'sales_management_orders_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadFromStorage(): Order[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as Order[];
  } catch {
    return null;
  }
}

function saveToStorage(orders: Order[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private orders$ = new BehaviorSubject<Order[]>(
    loadFromStorage() ?? [
      {
        id: 1,
        customerId: 1,
        createdAt: new Date().toISOString(),
        items: [
          { productId: 1, quantity: 1, unitPrice: 400 },
          { productId: 2, quantity: 2, unitPrice: 90 }
        ]
      }
    ]
  );

  constructor(private products: ProductService) {
    this.orders$.subscribe(list => saveToStorage(list));
  }

  getAll(): Observable<Order[]> {
    return this.orders$.asObservable();
  }

  getCurrent(): Order[] {
    return this.orders$.getValue();
  }

  getById(id: number): Order | undefined {
    return this.orders$.getValue().find(o => o.id === id);
  }

  /**
   * Creates an order and reduces stock for each product.
   * Throws if any product is missing or stock is insufficient.
   */
  create(input: { customerId: number; items: Array<{ productId: number; quantity: number }> }): void {
    const currentOrders = this.orders$.getValue();
    const nextId = currentOrders.length ? Math.max(...currentOrders.map(o => o.id)) + 1 : 1;

    const items: OrderItem[] = input.items.map(i => {
      const product = this.products.getById(i.productId);
      if (!product) throw new Error(`Product ${i.productId} not found`);
      if (i.quantity <= 0) throw new Error('Quantity must be greater than 0');
      if (product.stock < i.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      return { productId: i.productId, quantity: i.quantity, unitPrice: product.price };
    });

    // reduce stock (after validations)
    for (const i of input.items) {
      const product = this.products.getById(i.productId);
      if (!product) continue;
      this.products.update(i.productId, { stock: Math.max(0, product.stock - i.quantity) });
    }

    const order: Order = {
      id: nextId,
      customerId: input.customerId,
      createdAt: new Date().toISOString(),
      items
    };

    this.orders$.next([order, ...currentOrders]);
  }

  delete(id: number): void {
    const current = this.orders$.getValue();
    this.orders$.next(current.filter(o => o.id !== id));
  }

  clearAll(): void {
    this.orders$.next([]);
  }
}

