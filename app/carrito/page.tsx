import type { Metadata } from "next";
import CartPage from "@/features/cart/components/CartPage";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default function CarritoPage() {
  return <CartPage />;
}
