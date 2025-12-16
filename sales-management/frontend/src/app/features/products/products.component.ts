import { Component } from '@angular/core';
import { ProductFormComponent } from './product-form/product-form.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [RouterModule, ProductFormComponent],

  // ProductFormComponent
  standalone: true,
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

}
