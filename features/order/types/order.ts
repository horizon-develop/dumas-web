import { OrderState } from "./orderState";
import { Address } from "../../address/types/address";
import { CartItemResponse } from "../../cart/types/cartDto";

export interface OrderDetailResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  orderDate: string;
  state: OrderState;
  totalAmount: number;
  address: Address;
  paymentMethod: string;
  details: OrderDetailResponse[];
}

export interface CheckoutRequest {
  addressId: number;
  paymentMethod: "mercadopago" | "efectivo" | "transferencia" | "cuenta_corriente";
  items: CartItemResponse[];
  total: number;
}

export interface CheckoutResponse {
  id: number;
  orderNumber: string;
  orderDate: string;
}
