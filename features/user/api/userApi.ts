import apiClient from "../../../shared/utils/axios";
import { ClientUsersCountResponse, User } from "../types/user";

export async function getClientUsersCount(): Promise<number> {
  const response = await apiClient.get<ClientUsersCountResponse>("/api/users/clients/count");
  return response.data.count;
}

export interface CompleteProfileRequest {
  name: string;
  email: string;
  taxId?: string;
  legalCompanyName?: string;
  phoneNumber?: string;
  profile?: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  taxId?: string;
  legalCompanyName?: string;
  phoneNumber?: string;
  profile?: string;
}

export const completeProfile = async (profileData: CompleteProfileRequest): Promise<User> => {
  const response = await apiClient.put<User>("/api/users/complete-profile", profileData);
  return response.data;
};

export const updateProfile = async (profileData: UpdateProfileRequest): Promise<User> => {
  const response = await apiClient.put<User>("/api/users/profile", profileData);
  return response.data;
};

export const getCurrentDebt = async (): Promise<number> => {
  const response = await apiClient.get<{ currentDebt: number }>("/api/users/current-debt");
  return response.data.currentDebt;
};

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const changePassword = async (request: ChangePasswordRequest): Promise<void> => {
  await apiClient.post('/api/users/change-password', request);
};