import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Customer, CustomerService } from '../customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.css'
})
export class CustomerFormComponent implements OnInit {
  form!: FormGroup;
  customers$!: Observable<Customer[]>;

  constructor(
    private fb: FormBuilder,
    private customers: CustomerService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
      company: ['']
    });

    this.customers$ = this.customers.getAll();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value as { name: string; email: string; phone: string; company?: string };
    this.customers.add({
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      company: v.company?.trim() || undefined
    });

    this.form.reset({ name: '', email: '', phone: '', company: '' });
  }

  deleteCustomer(id: number): void {
    this.customers.delete(id);
  }
}
