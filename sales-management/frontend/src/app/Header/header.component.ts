import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthUser } from '../auth/auth.service';
import { UiLayoutService } from '../ui-layout.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  q = '';
  user$: Observable<AuthUser | null>;

  constructor(
    private router: Router,
    public ui: UiLayoutService,
    public auth: AuthService
  ) {
    this.user$ = this.auth.currentUser();
  }

  search(): void {
    const q = this.q.trim();
    this.router.navigate(['/products/list'], { queryParams: { q: q || null } });
    // On mobile, make sure content is visible
    this.ui.closeSidebar();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
