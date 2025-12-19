import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  createdAt: string; // ISO string
}

type CustomerCreate = Omit<Customer, 'id' | 'createdAt'>;
type CustomerUpdate = Partial<Omit<Customer, 'id' | 'createdAt'>>;

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly storageKey = 'sales_mgmt_customers_v1';
  private readonly customers$ = new BehaviorSubject<Customer[]>(this.load());

  getAll(): Observable<Customer[]> {
    return this.customers$.asObservable();
  }

  getCurrent(): Customer[] {
    return this.customers$.getValue();
  }

  getById(id: number): Customer | undefined {
    return this.customers$.getValue().find(c => c.id === id);
  }

  add(customer: CustomerCreate): Customer {
    const current = this.customers$.getValue();
    const nextId = current.length ? Math.max(...current.map(c => c.id)) + 1 : 1;
    const created: Customer = {
      id: nextId,
      createdAt: new Date().toISOString(),
      ...customer
    };
    this.set([...current, created]);
    return created;
  }

  update(id: number, updates: CustomerUpdate): void {
    const current = this.customers$.getValue();
    this.set(current.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }

  delete(id: number): void {
    const current = this.customers$.getValue();
    this.set(current.filter(c => c.id !== id));
  }

  private set(customers: Customer[]): void {
    this.customers$.next(customers);
    this.save(customers);
  }

  private load(): Customer[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed as Customer[];
    } catch {
      return [];
    }
  }

  private save(customers: Customer[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(customers));
    } catch {
      // ignore storage quota / privacy errors
    }
  }
}



