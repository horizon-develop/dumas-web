import apiClient from "../../../shared/utils/axios";
import { convertBigDecimalToNumber } from "../../../shared/utils/numberUtils";
import type { OrderResponse } from "../../order/types/order";

export interface OrderPageResponse {
  content: OrderResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AdminOrderPage {
  orders: OrderResponse[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export const fetchAllOrders = async (
  page = 0,
  size = 10
): Promise<AdminOrderPage> => {
  const response = await apiClient.get<OrderPageResponse>("/api/order/all", {
    params: { page, size }
  });

  const data = response.data;
  const content = Array.isArray(data?.content) ? data.content : [];

  const orders: OrderResponse[] = content.map((order) => ({
    ...order,
    totalAmount: convertBigDecimalToNumber(order.totalAmount),
    details: order.details?.map((detail) => ({
      ...detail,
      unitPrice: convertBigDecimalToNumber(detail.unitPrice)
    })) || []
  }));

  return {
    orders,
    page: Number(data?.pageNumber ?? page),
    size: Number(data?.pageSize ?? size),
    totalPages: Number(data?.totalPages ?? 1),
    totalElements: Number(data?.totalElements ?? orders.length),
    last: data?.last ?? true
  };
};

export const fetchOrderById = async (id: number): Promise<OrderResponse> => {
  const response = await apiClient.get<OrderResponse>(`/api/order/${id}`);
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

export const updateOrderStatus = async (
  orderId: number,
  newStatus: string
): Promise<OrderResponse> => {
  const response = await apiClient.put<OrderResponse>(
    `/api/order/${orderId}/status`,
    null,
    { params: { newStatus } }
  );

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

export const getOrdersLastMonthCount = async (): Promise<number> => {
  const response = await apiClient.get<number>("/api/order/orders-last-month-count");
  return response.data;
};
