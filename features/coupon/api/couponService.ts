import apiClient from "../../../shared/utils/axios";
import { CouponResponse, CreateCouponRequest, UpdateCouponRequest } from "../types/couponDto";

interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const getAllCoupons = async (): Promise<CouponResponse[]> => {
  const response = await apiClient.get<PaginatedResponse<CouponResponse>>("/api/coupons/all");
  return response.data.content;
};

export const getValidCouponsCount = async (): Promise<number> => {
  const response = await apiClient.get<{ count: number }>("/api/coupons/valid/count");
  return response.data.count;
};

export const createCoupon = async (coupon: CreateCouponRequest): Promise<CouponResponse> => {
  const response = await apiClient.post<CouponResponse>("/api/coupons/create", coupon);
  return response.data;
};

export const updateCoupon = async (id: number, coupon: UpdateCouponRequest): Promise<CouponResponse> => {
  const response = await apiClient.put<CouponResponse>(`/api/coupons/update/${id}`, coupon);
  return response.data;
};

export const deleteCoupon = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete<boolean>(`/api/coupons/delete/${id}`);
  return response.data;
};