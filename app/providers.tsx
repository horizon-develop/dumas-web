"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/features/cart/context/CartContext";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster
          position="top-right"
          containerStyle={{ zIndex: 99999 }}
          toastOptions={{ duration: 3500 }}
        />
      </CartProvider>
    </SessionProvider>
  );
}
