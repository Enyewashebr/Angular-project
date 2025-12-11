import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Header/header.component';
import { ProductsComponent } from './features/products/products.component';

@Component({
  selector: 'app-root',
  imports: [ HeaderComponent, ProductsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fikat';
}
