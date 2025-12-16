import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products$ = new BehaviorSubject<Product[]>([
    { id: 1, name: 'Samsung TV', category: 'Electronics', price: 400, stock: 20, description: 'Smart TV' },
    { id: 2, name: 'Nike Shoes', category: 'Clothes', price: 90, stock: 50, description: 'Running shoes' },
    { id: 3, name: 'Air Conditioner', category: 'Home Appliances', price: 300, stock: 10, description: '1.5 ton AC' }
  ]);

  getAll(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  getById(id: number): Product | undefined {
    return this.products$.getValue().find(p => p.id === id);
  }

  add(product: Omit<Product, 'id'>): void {
    const current = this.products$.getValue();
    const nextId = current.length ? Math.max(...current.map(p => p.id)) + 1 : 1;
    this.products$.next([...current, { ...product, id: nextId }]);
  }

  update(id: number, updates: Partial<Omit<Product, 'id'>>): void {
    const current = this.products$.getValue();
    this.products$.next(current.map(p => p.id === id ? { ...p, ...updates } : p));
  }

  delete(id: number): void {
    const current = this.products$.getValue();
    this.products$.next(current.filter(p => p.id !== id));
  }
}

