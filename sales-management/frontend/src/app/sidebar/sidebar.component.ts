import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { UiLayoutService } from '../ui-layout.service';

@Component({
  selector: 'app-sidebar',
  imports: [NgIf, RouterLink, RouterLinkActive, AsyncPipe],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  productsOpen = false;
  customersOpen = false;
  ordersOpen = false;

  sidebarOpen$!: Observable<boolean>;

  constructor(public ui: UiLayoutService) {
    this.sidebarOpen$ = this.ui.sidebarOpen();
  }

  toggleMenu(menu: 'products' | 'customers' | 'orders'): void {
    if (menu === 'products') this.productsOpen = !this.productsOpen;
    if (menu === 'customers') this.customersOpen = !this.customersOpen;
    if (menu === 'orders') this.ordersOpen = !this.ordersOpen;
  }
}
