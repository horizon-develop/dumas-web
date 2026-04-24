import apiClient from "../../../shared/utils/axios";
import type { CheckoutRequest } from "../../order/types/order";
import { OrderConfirmationResponse, PaymentConfirmationRequest, PaymentStatusResponse, PreferenceResponse } from "../types/paymentDto";

export const createMercadoPagoPreference = async (checkoutData: CheckoutRequest): Promise<PreferenceResponse> => {
  try {
    const response = await apiClient.post("/api/payments/mercadopago/create-preference", checkoutData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
  try {
    const response = await apiClient.get(`/api/payments/mercadopago/status/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const processSuccessfulPayment = async (paymentConfirmationRequest: PaymentConfirmationRequest): Promise<OrderConfirmationResponse> => {
  try {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await apiClient.post("/api/payments/mercadopago/confirm", paymentConfirmationRequest);
        return response.data;
      } catch (error: any) {
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        } else {
          throw error;
        }
      }
    }

    throw new Error("Maximum retry attempts reached");
  } catch (error) {
    throw error;
  }
}; 
