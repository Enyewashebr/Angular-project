import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { Product, ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  vm$: Observable<{ products: Product[]; q: string }>;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const q$ = this.route.queryParamMap.pipe(map(p => (p.get('q') ?? '').trim().toLowerCase()));

    this.vm$ = combineLatest([this.productService.getAll(), q$]).pipe(
      map(([products, q]) => {
        if (!q) return { products, q: '' };
        const filtered = products.filter(p =>
          `${p.name} ${p.category}`.toLowerCase().includes(q)
        );
        return { products: filtered, q };
      })
    );
  }

  updateSearch(raw: string): void {
    const q = raw.trim();
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: q || null }, queryParamsHandling: 'merge' });
  }

  delete(id: number): void {
    this.productService.delete(id);
  }
}
