import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { Customer, CustomerService } from '../customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent {
  vm$: Observable<{ customers: Customer[]; q: string }>;

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const q$ = this.route.queryParamMap.pipe(map(p => (p.get('q') ?? '').trim().toLowerCase()));

    this.vm$ = combineLatest([this.customerService.getAll(), q$]).pipe(
      map(([customers, q]) => {
        if (!q) return { customers, q: '' };
        const filtered = customers.filter(c =>
          `${c.name} ${c.email} ${c.phone} ${c.company ?? ''}`.toLowerCase().includes(q)
        );
        return { customers: filtered, q };
      })
    );
  }

  updateSearch(raw: string): void {
    const q = raw.trim();
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: q || null }, queryParamsHandling: 'merge' });
  }

  deleteCustomer(id: number): void {
    this.customerService.delete(id);
  }
}
