import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Customer, CustomerService } from '../customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent {
  customers$: Observable<Customer[]>;

  constructor(private customers: CustomerService) {
    this.customers$ = this.customers.getAll();
  }

  delete(id: number): void {
    this.customers.delete(id);
  }
}
