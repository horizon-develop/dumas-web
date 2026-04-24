import { PaymentStatus } from "./paymentStatus";

export interface PreferenceResponse {
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
}

export interface PaymentStatusResponse {
    paymentId: string;
    status: PaymentStatus;
    paymentMethod: string;
    paymentType: string;
}

export interface PaymentConfirmationRequest {
    paymentId: string;
    preferenceId: string;
    status: string;
}

export interface OrderConfirmationResponse {
    orderId: number;
    orderNumber: string;
    orderDate: string;
    status: string;
    paymentId: string;
}