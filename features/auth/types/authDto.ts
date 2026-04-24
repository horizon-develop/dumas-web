import { Profile } from "../../user/types/profile";
import { Role } from "../../user/types/role";

export interface RegisterClientRequest {
    email: string;
    password: string;
    profile: Profile;
    taxId: string;
    legalCompanyName: string;
    phoneNumber: string;
}

export interface RegisterAdminRequest {
    email: string;
    password: string;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GoogleAuthRequest {
    token: string;
    profile: Profile;
    taxId: string;
    legalCompanyName: string;
    phoneNumber: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    id: number;
    email: string;
    name: string;
    role: Role;
    profile: Profile;
    isGoogleLogin: boolean;
    clientDetails: ClientDetailsResponse;
}

export interface RegisterAdminResponse {
    accessToken: string;
    refreshToken: string;
    email: string;
    name: string;
    role: Role;
}

export interface ClientDetailsResponse {
    id: number;
    taxId: string;
    legalCompanyName: string;
    phoneNumber: string;
    profile: Profile;
    currentDebt: number;
}