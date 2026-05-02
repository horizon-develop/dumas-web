"use client";

import { useState } from "react";
import { FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useCart } from "@/features/cart/context/CartContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Props {
  sku: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  inStock: boolean;
}

export default function AddToCart({ sku, name, price, imageUrl, inStock }: Props) {
  const { data: session } = useSession();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  if (!session) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-center">
        <p className="text-sm text-gray-600 mb-3">Iniciá sesión para ver el precio y agregar al carrito</p>
        <Link
          href="/login"
          className="inline-block px-5 py-2 bg-[#8B0000] text-white text-sm font-semibold rounded-lg hover:bg-[#6A0000] transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem({ sku, name, price, imageUrl: imageUrl ?? undefined }, qty);
    toast.success(`${qty > 1 ? `${qty}x ` : ""}${name} agregado al carrito`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-[#8B0000]">
          ${price.toLocaleString("es-AR")}
        </span>
        <span className="text-sm text-gray-400">IVA incluido</span>
      </div>

      {inStock ? (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Cantidad</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Reducir cantidad"
              >
                <FiMinus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-800 min-w-[2.5rem] text-center border-x border-gray-300">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Aumentar cantidad"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-3 bg-[#8B0000] text-white text-sm font-semibold rounded-xl hover:bg-[#6A0000] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <FiShoppingCart className="h-5 w-5" />
            Agregar al carrito
          </button>
        </>
      ) : (
        <div className="w-full py-3 bg-gray-100 text-gray-400 text-sm font-semibold rounded-xl text-center">
          Sin stock disponible
        </div>
      )}
    </div>
  );
}
