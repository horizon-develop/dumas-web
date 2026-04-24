import { auth, googleProvider } from '../../../shared/config/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { clearUserData } from '../utils/authUtils';
import { RegisterClientRequest, AuthResponse, LoginRequest, RegisterAdminRequest } from '../types/authDto';
import apiClient from '../../../shared/utils/axios';

export const registerUser = async (request: RegisterClientRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/register', request);
  return response.data;
};

export const registerAdmin = async (request: RegisterAdminRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/register/admin', request);
  return response.data;
};

export const loginUser = async (request: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/login', request);
  return response.data;
};

export const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/auth/google', { token: idToken });
  return response.data;
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logOut = async () => {
  await signOut(auth);
  clearUserData();
}; 
