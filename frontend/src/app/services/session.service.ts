import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CustomerSession {
  customerId: string;
  isAuthenticated: boolean;
  loginTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'customer_session';
  private sessionSubject = new BehaviorSubject<CustomerSession | null>(this.getStoredSession());

  constructor() {
    // Initialize session from localStorage on service creation
    this.loadSessionFromStorage();
  }

  // Get current session as observable
  get session$(): Observable<CustomerSession | null> {
    return this.sessionSubject.asObservable();
  }

  // Get current session value
  get currentSession(): CustomerSession | null {
    return this.sessionSubject.value;
  }

  // Check if user is authenticated
  get isAuthenticated(): boolean {
    const session = this.currentSession;
    return session?.isAuthenticated || false;
  }

  // Get customer ID
  get customerId(): string | null {
    const session = this.currentSession;
    return session?.customerId || null;
  }

  // Create new session after successful login
  createSession(customerId: string): void {
    const session: CustomerSession = {
      customerId,
      isAuthenticated: true,
      loginTime: new Date()
    };

    this.saveSessionToStorage(session);
    this.sessionSubject.next(session);
  }

  // Clear session on logout
  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.sessionSubject.next(null);
  }

  // Check if session is still valid (optional: add expiration logic)
  isSessionValid(): boolean {
    const session = this.currentSession;
    if (!session) return false;

    // Optional: Add session expiration logic here
    // For example, expire after 24 hours
    const now = new Date();
    const loginTime = new Date(session.loginTime);
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    // Session expires after 24 hours
    if (hoursDiff > 24) {
      this.clearSession();
      return false;
    }

    return session.isAuthenticated;
  }

  // Private methods for localStorage management
  private saveSessionToStorage(session: CustomerSession): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
    }
  }

  private getStoredSession(): CustomerSession | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        // Convert loginTime back to Date object
        session.loginTime = new Date(session.loginTime);
        return session;
      }
    } catch (error) {
      console.error('Error reading session from localStorage:', error);
    }
    return null;
  }

  private loadSessionFromStorage(): void {
    const session = this.getStoredSession();
    if (session && this.isSessionValid()) {
      this.sessionSubject.next(session);
    } else if (session && !this.isSessionValid()) {
      // Session exists but is invalid, clear it
      this.clearSession();
    }
  }
} 