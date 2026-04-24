/**
 * Global window type extensions for third-party SDKs
 */

declare global {
  interface Window {
    /**
     * MercadoPago SDK instance
     * @see https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/overview
     */
    MercadoPago: any;
  }
}

export {};
