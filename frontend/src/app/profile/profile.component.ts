import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';
import { CustomerProfile } from '../models/profile.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  customerId: string | null = null;
  profileData: CustomerProfile | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Get customer ID from session
    this.customerId = this.sessionService.customerId;
    
    if (!this.customerId) {
      this.router.navigate(['/login']);
      return;
    }

    // Load profile data
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getProfile().subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Profile response:', response);
        
        // Parse XML response if needed
        if (typeof response === 'string') {
          // Handle XML response
          this.parseProfileXML(response);
        } else {
          // Handle JSON response
          this.profileData = response;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
        console.error('Profile loading error:', error);
      }
    });
  }

  private parseProfileXML(xmlString: string): void {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Extract profile data from XML based on your SAP response structure
      const profileElement = xmlDoc.querySelector('PrProfile');
      
      if (profileElement) {
        this.profileData = {
          customerId: this.getTextContent(profileElement, 'CustomerId'),
          country: this.getTextContent(profileElement, 'Country'),
          name: this.getTextContent(profileElement, 'Name'),
          city: this.getTextContent(profileElement, 'City'),
          street: this.getTextContent(profileElement, 'Street'),
          pincode: this.getTextContent(profileElement, 'Pincode'),
          rawXml: xmlString
        };
      } else {
        // Fallback if PrProfile not found
        this.profileData = { 
          customerId: this.customerId || '', 
          country: '',
          name: '',
          city: '',
          street: '',
          pincode: '',
          rawXml: xmlString,
          error: 'Profile data structure not found in response'
        };
      }
    } catch (error) {
      console.error('XML parsing error:', error);
      this.profileData = { 
        customerId: this.customerId || '', 
        country: '',
        name: '',
        city: '',
        street: '',
        pincode: '',
        rawXml: xmlString,
        error: 'Failed to parse XML response'
      };
    }
  }

  private getTextContent(element: Element, tagName: string): string {
    const child = element.querySelector(tagName);
    return child ? child.textContent || '' : '';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/login']);
  }
} 