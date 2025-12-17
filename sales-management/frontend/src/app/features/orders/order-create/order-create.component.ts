import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, startWith, Subscription } from 'rxjs';
import { Customer, CustomerService } from '../../customers/customer.service';
import { Product, ProductService } from '../../products/product.service';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.css'
})
export class OrderCreateComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  vm$!: Observable<{
    customers: Customer[];
    products: Product[];
    items: Array<{
      productId: number | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      productName: string;
      stock: number | null;
      stockOk: boolean;
    }>;
    total: number;
    canSubmit: boolean;
  }>;

  private sub = new Subscription();

  constructor(
    private fb: FormBuilder,
    private customers: CustomerService,
    private products: ProductService,
    private orders: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      customerId: [null, Validators.required],
      items: this.fb.array([this.newItemGroup()])
    });

    const qpSub = this.route.queryParamMap.subscribe(p => {
      const raw = p.get('customerId');
      if (raw) {
        const id = Number(raw);
        if (!Number.isNaN(id)) this.form.patchValue({ customerId: id });
      }
    });
    this.sub.add(qpSub);

    const customers$ = this.customers.getAll();
    const products$ = this.products.getAll();
    const formValue$ = this.form.valueChanges.pipe(startWith(this.form.value));

    this.vm$ = combineLatest([customers$, products$, formValue$]).pipe(
      map(([customers, products, value]) => {
        const items = ((value?.items ?? []) as Array<{ productId: number | null; quantity: number }>).map(i => {
          const product = i.productId ? products.find(p => p.id === Number(i.productId)) : undefined;
          const unitPrice = product?.price ?? 0;
          const qty = Number(i.quantity || 0);
          const stock = product?.stock ?? null;
          const stockOk = product ? qty <= product.stock : false;
          return {
            productId: i.productId ?? null,
            quantity: qty,
            unitPrice,
            lineTotal: unitPrice * qty,
            productName: product?.name ?? '',
            stock,
            stockOk
          };
        });

        const total = items.reduce((sum, it) => sum + it.lineTotal, 0);
        const canSubmit =
          !!value?.customerId &&
          items.length > 0 &&
          items.every(i => i.productId && i.quantity > 0 && i.stockOk) &&
          total > 0;

        return { customers, products, items, total, canSubmit };
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    this.itemsArray.push(this.newItemGroup());
  }

  removeItem(index: number): void {
    if (this.itemsArray.length <= 1) return;
    this.itemsArray.removeAt(index);
  }

  submit(vm: { customers: Customer[]; products: Product[] }): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const customerId = Number(this.form.value.customerId);
    const customer = vm.customers.find(c => c.id === customerId);
    if (!customer) return;

    const rawItems = (this.form.value.items ?? []) as Array<{ productId: number | null; quantity: number }>;
    const items = rawItems
      .map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) }))
      .filter(i => Number.isFinite(i.productId) && i.productId > 0 && Number.isFinite(i.quantity) && i.quantity > 0);

    if (!items.length) return;

    // Validate stock + build payload items
    const payloadItems: Array<{ productId: number; productName: string; unitPrice: number; quantity: number }> = [];
    for (const it of items) {
      const p = this.products.getById(it.productId);
      if (!p) return;
      if (it.quantity > p.stock) return;
      payloadItems.push({
        productId: p.id,
        productName: p.name,
        unitPrice: p.price,
        quantity: it.quantity
      });
    }

    const order = this.orders.create({
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items: payloadItems
    });

    // Update stock
    for (const it of payloadItems) {
      const p = this.products.getById(it.productId);
      if (!p) continue;
      this.products.update(p.id, { stock: Math.max(0, p.stock - it.quantity) });
    }

    this.router.navigate(['/orders/details', order.id]);
  }

  private newItemGroup(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }
}
