import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from './Header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UiLayoutService } from './ui-layout.service';
// import { ProductsComponent } from './features/products/products.component';
// import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fikat';

  sidebarOpen$!: Observable<boolean>;

  constructor(public ui: UiLayoutService) {
    this.sidebarOpen$ = this.ui.sidebarOpen();
  }
}
