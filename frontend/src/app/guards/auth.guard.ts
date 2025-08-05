import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.sessionService.isSessionValid()) {
      return true;
    } else {
      // Clear any invalid session
      this.sessionService.clearSession();
      // Redirect to login page
      this.router.navigate(['/login']);
      return false;
    }
  }
} 