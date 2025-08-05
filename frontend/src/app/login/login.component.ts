import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  successMessage: string = '';

  constructor(
    private loginService: LoginService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;
    this.loginService.login(this.username, this.password).subscribe({
      next: (response: string) => {
        this.isLoading = false;
        // Parse XML response
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response, 'text/xml');
        const outputNode = xmlDoc.querySelector('Output');
        if (outputNode && outputNode.textContent) {
          if (outputNode.textContent.trim().toLowerCase() === 'login successful.') {
            this.successMessage = 'Login successful!';
            this.errorMessage = '';
            
            // Create session and redirect to dashboard
            this.sessionService.createSession(this.username);
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = outputNode.textContent.trim();
            this.successMessage = '';
            alert(this.errorMessage);
          }
        } else {
          this.errorMessage = 'Unexpected response from server.';
          this.successMessage = '';
          alert('Unexpected response from server.');
        }
        console.log('Login response:', response);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err;
        this.successMessage = '';
        alert(err);
      }
    });
  }
}
