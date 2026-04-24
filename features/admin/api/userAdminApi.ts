import apiClient from "../../../shared/utils/axios";
import type { UserAdminResponse } from "../../user/types/user";
import type { PaginatedResponse } from "../../product/types/productDto";

export interface AdminUpdateUserRequest {
  name: string;
  email: string;
  taxId?: string;
  legalCompanyName?: string;
  phoneNumber?: string;
  profile?: string;
}

export const fetchAllUsers = async (page: number = 0, size: number = 20): Promise<PaginatedResponse<UserAdminResponse>> => {
  const response = await apiClient.get<PaginatedResponse<UserAdminResponse>>(`/api/users/all?page=${page}&size=${size}`);
  return response.data;
};

export const updateUser = async (id: number, userData: AdminUpdateUserRequest): Promise<UserAdminResponse> => {
  const response = await apiClient.put<UserAdminResponse>(`/api/users/admin/update/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete(`/api/users/admin/delete/${id}`);
  return response.data === true;
};