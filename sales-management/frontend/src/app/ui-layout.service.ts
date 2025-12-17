import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiLayoutService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(false);

  sidebarOpen(): Observable<boolean> {
    return this.sidebarOpenSubject.asObservable();
  }

  getSidebarOpen(): boolean {
    return this.sidebarOpenSubject.getValue();
  }

  openSidebar(): void {
    this.sidebarOpenSubject.next(true);
  }

  closeSidebar(): void {
    this.sidebarOpenSubject.next(false);
  }

  toggleSidebar(): void {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.getValue());
  }
}


