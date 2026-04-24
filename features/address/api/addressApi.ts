import apiClient from '../../../shared/utils/axios';
import { AddressResponse, CreateAddressRequest } from '../types/addressDto';

export const createAddress = async (request: CreateAddressRequest): Promise<AddressResponse> => {
    const response = await apiClient.post<AddressResponse>('/api/address', request);
    return response.data;
};

export const getUserAddresses = async (): Promise<AddressResponse[]> => {
    const response = await apiClient.get<AddressResponse[]>('/api/address');
    return response.data;
};

export const deleteAddress = async (id: number): Promise<boolean> => {
    const response = await apiClient.delete<boolean>(`/api/address/${id}`);
    return response.data;
};

export const updateAddress = async (id: number, request: CreateAddressRequest): Promise<AddressResponse> => {
    const response = await apiClient.put<AddressResponse>(`/api/address/${id}`, request);
    return response.data;
};
