import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [NgIf, RouterLink, RouterLinkActive],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  productsOpen = false;
  customersOpen = false;
  ordersOpen = false;

  toggleMenu(menu: 'products' | 'customers' | 'orders'): void {
    if (menu === 'products') this.productsOpen = !this.productsOpen;
    if (menu === 'customers') this.customersOpen = !this.customersOpen;
    if (menu === 'orders') this.ordersOpen = !this.ordersOpen;
  }
}
