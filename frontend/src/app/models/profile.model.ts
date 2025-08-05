export interface CustomerProfile {
  customerId: string;
  country: string;
  name: string;
  city: string;
  street: string;
  pincode: string;
  rawXml?: string;
  error?: string;
}

export interface ProfileResponse {
  customerId: string;
  profileData: CustomerProfile | null;
  error?: string;
} 