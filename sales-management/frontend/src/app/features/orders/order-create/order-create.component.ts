import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Customer, CustomerService } from '../../customers/customer.service';
import { Product, ProductService } from '../../products/product.service';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.css'
})
export class OrderCreateComponent implements OnInit {
  form!: FormGroup;
  products$: Observable<Product[]>;
  customers$: Observable<Customer[]>;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private products: ProductService,
    private customers: CustomerService,
    private orders: OrderService,
    private router: Router
  ) {
    this.products$ = this.products.getAll();
    this.customers$ = this.customers.getAll();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      customerId: [null, Validators.required],
      items: this.fb.array([])
    });
    this.addItem();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        productId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]]
      })
    );
  }

  removeItem(index: number): void {
    if (this.items.length <= 1) return;
    this.items.removeAt(index);
  }

  getLineTotal(productId: number | null, quantity: number | null): number {
    if (!productId || !quantity) return 0;
    const p = this.products.getById(Number(productId));
    if (!p) return 0;
    return p.price * Number(quantity);
  }

  getOrderTotal(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const productId = ctrl.get('productId')?.value as number | null;
      const quantity = ctrl.get('quantity')?.value as number | null;
      return sum + this.getLineTotal(productId, quantity);
    }, 0);
  }

  submit(): void {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const customerId = Number(this.form.value.customerId);
    const items = (this.form.value.items as Array<{ productId: number; quantity: number }>)
      .map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) }))
      .filter(i => !!i.productId && i.quantity > 0);

    if (!items.length) {
      this.error = 'Please add at least one product.';
      return;
    }

    try {
      this.orders.create({ customerId, items });
      this.router.navigate(['/orders/list']);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to create order.';
    }
  }
}
