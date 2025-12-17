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

const STORAGE_KEY = 'sales_management_customers_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadFromStorage(): Customer[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as Customer[];
  } catch {
    return null;
  }
}

function saveToStorage(customers: Customer[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch {
    // ignore storage failures (quota/private mode/etc)
  }
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private customers$ = new BehaviorSubject<Customer[]>(
    loadFromStorage() ?? [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 555-0100',
        company: 'ACME Inc.',
        createdAt: new Date().toISOString()
      }
    ]
  );

  constructor() {
    // keep storage in sync
    this.customers$.subscribe(list => saveToStorage(list));
  }

  getAll(): Observable<Customer[]> {
    return this.customers$.asObservable();
  }

  getCurrent(): Customer[] {
    return this.customers$.getValue();
  }

  getById(id: number): Customer | undefined {
    return this.customers$.getValue().find(c => c.id === id);
  }

  add(customer: Omit<Customer, 'id' | 'createdAt'>): void {
    const current = this.customers$.getValue();
    const nextId = current.length ? Math.max(...current.map(c => c.id)) + 1 : 1;
    const next: Customer = { ...customer, id: nextId, createdAt: new Date().toISOString() };
    this.customers$.next([...current, next]);
  }

  update(id: number, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): void {
    const current = this.customers$.getValue();
    this.customers$.next(current.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }

  delete(id: number): void {
    const current = this.customers$.getValue();
    this.customers$.next(current.filter(c => c.id !== id));
  }

  clearAll(): void {
    this.customers$.next([]);
  }
}

