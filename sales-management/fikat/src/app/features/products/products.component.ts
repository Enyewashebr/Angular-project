import { Component } from '@angular/core';
import { ProductFormComponent } from './product-form/product-form.component';

@Component({
  selector: 'app-products',
  imports: [ProductFormComponent],
  standalone: true,
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

}
