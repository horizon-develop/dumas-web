import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as cartApi from "../api/cartApi";
import { CartItemResponse } from "../types/cartDto";
import { isAuthenticated as checkAuth } from "../../auth/utils/authUtils";

type CartItem = CartItemResponse;

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  removeItem: (productId: string | number) => Promise<void>;
  updateItemQty: (productId: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncFromServer: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem("cartItems");
    if (!raw) return [];
    try { return JSON.parse(raw) as CartItem[]; } catch { return []; }
  });

  useEffect(() => {
    const handleAuthLogin = async () => {
      await syncFromServer();
    };

    const handleAuthLogout = () => {
      setItems([]);
      localStorage.removeItem("cartItems");
    };

    window.addEventListener("auth-login", handleAuthLogin);
    window.addEventListener("auth-logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth-login", handleAuthLogin);
      window.removeEventListener("auth-logout", handleAuthLogout);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-update"));
  }, [items]);

  const addItem = async (item: Omit<CartItem, "quantity">, quantity = 1) => {
    if (!checkAuth()) {
      throw new Error("AUTH_REQUIRED");
    }

    const previous = items;
    setItems(prev => {
      const exists = prev.find(i => i.productId === item.productId);
      if (exists) {
        return prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });

    try {
      await cartApi.addToCart(item.productId, quantity);
    } catch (err) {
      setItems(previous);
      throw err;
    }
  };

  const removeItem = async (productId: string | number) => {
    setItems(prev => prev.filter(i => i.productId !== Number(productId)));
    try { await cartApi.removeFromCart(Number(productId)); } catch { /* ignore */ }
  };

  const updateItemQty = async (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i => i.productId === Number(productId) ? { ...i, quantity } : i));
    try { await cartApi.updateCartItemQuantity(Number(productId), quantity); } catch { /* ignore */ }
  };

  const clearCart = async () => {
    setItems([]);
    try { await cartApi.clearCart(); } catch { /* ignore */ }
  };

  const syncFromServer = async () => {
    try {
      const server = await cartApi.getCart();
      if (server?.items) setItems(server.items);
    } catch { /* ignore */ }
  };

  const itemCount = useMemo(() => items.length, [items]);
  const total = useMemo(() => items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0), [items]);

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, removeItem, updateItemQty, clearCart, syncFromServer }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
