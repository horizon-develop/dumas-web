export interface CartItemResponse {
  productId: number;
  productName: string;
  urlImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  total: number;
  totalItems: number;
}