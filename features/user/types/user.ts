import { Role } from "./role";
import type { Profile } from "./profile";

// Client details as returned by API (for both admin and profile endpoints)
export interface ClientDetailsResponse {
  id?: number;
  taxId: string;
  legalCompanyName: string;
  phoneNumber: string;
  profile: Profile;
  currentDebt?: number;
}

// User data stored in localStorage and returned by auth/profile endpoints
export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  profile?: Profile;
  isGoogleLogin?: boolean;
  clientDetails?: ClientDetailsResponse;
}

export interface ClientUsersCountResponse {
  count: number;
}

// Response from admin endpoints (GET /api/users/all, PUT /api/users/admin/update/{id})
export interface ClientDetailAdminResponse {
  profile: Profile;
  taxId: string;
  legalCompanyName: string;
  phoneNumber: string;
  currentDebt: number | null;
}

export interface UserAdminResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  isGoogleLogin: boolean;
  createdAt: string;
  updatedAt: string;
  clientDetails: ClientDetailAdminResponse | null;
}