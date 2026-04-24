import apiClient from "../../../shared/utils/axios";
import { CartResponse } from "../types/cartDto";

export const getCart = async (): Promise<CartResponse> => {
  const response = await apiClient.get<CartResponse>("/api/cart");
  return response.data;
};

export const addToCart = async (productId: number, quantity: number = 1): Promise<string> => {
  const response = await apiClient.post<string>(`/api/cart/add?productId=${productId}&quantity=${quantity}`);
  return response.data;
};

export const updateCartItemQuantity = async (productId: number, quantity: number): Promise<string> => {
  const response = await apiClient.put<string>(`/api/cart/update?productId=${productId}&quantity=${quantity}`);
  return response.data;
};

export const removeFromCart = async (productId: number): Promise<string> => {
  const response = await apiClient.delete<string>(`/api/cart/remove/${productId}`);
  return response.data;
};

export const clearCart = async (): Promise<string> => {
  const response = await apiClient.post<string>(`/api/cart/clear`);
  return response.data;
};
