import apiClient from "../../../shared/utils/axios";
import { convertBigDecimalToNumber } from "../../../shared/utils/numberUtils";
import { CheckoutRequest, CheckoutResponse, OrderResponse } from "../types/order";

export const checkoutOrder = async (checkoutData: CheckoutRequest): Promise<CheckoutResponse> => {
  const response = await apiClient.post<CheckoutResponse>("/api/order/checkout", checkoutData);
  return response.data;
};

export const getOrderById = async (orderId: number): Promise<OrderResponse> => {
  const response = await apiClient.get<OrderResponse>(`/api/order/${orderId}`);
  const order = response.data;

  return {
    ...order,
    totalAmount: convertBigDecimalToNumber(order.totalAmount),
    details: order.details?.map((detail) => ({
      ...detail,
      unitPrice: convertBigDecimalToNumber(detail.unitPrice)
    })) || []
  };
};

export const getUserOrders = async (): Promise<OrderResponse[]> => {
  const response = await apiClient.get<OrderResponse[]>("/api/order/user-orders");

  return response.data.map((order) => ({
    ...order,
    totalAmount: convertBigDecimalToNumber(order.totalAmount),
    details: order.details?.map((detail) => ({
      ...detail,
      unitPrice: convertBigDecimalToNumber(detail.unitPrice)
    })) || []
  }));
};