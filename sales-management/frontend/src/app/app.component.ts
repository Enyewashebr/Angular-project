import { Component } from '@angular/core';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CustomerFormComponent], 
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
