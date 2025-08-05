import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'custportal';

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated on app startup
    if (this.sessionService.isSessionValid()) {
      // If user is authenticated and on login page, redirect to dashboard
      if (this.router.url === '/login' || this.router.url === '/') {
        this.router.navigate(['/dashboard']);
      }
    } else {
      // If session is invalid, clear it and ensure user is on login page
      this.sessionService.clearSession();
      if (this.router.url !== '/login') {
        this.router.navigate(['/login']);
      }
    }
  }
}
