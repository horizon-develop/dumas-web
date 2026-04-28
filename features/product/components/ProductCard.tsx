"use client";

import Link from "next/link";
import { FiShoppingCart, FiPackage } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useCart } from "@/features/cart/context/CartContext";

export interface ProductItem {
  ID: number;
  Codigo: string;
  concepto: string;
  rubro: string;
  subrubro: string;
  marca: string;
  PrecioFinal: number;
  Stock: number;
  imageUrl?: string | null;
}

export const ProductCard = ({ product }: { product: ProductItem }) => {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const inStock = product.Stock > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      toast("Iniciá sesión para agregar productos");
      return;
    }
    addItem({
      sku: product.Codigo,
      name: product.concepto,
      price: product.PrecioFinal,
      imageUrl: product.imageUrl ?? undefined,
    });
    toast.success("Agregado al carrito");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <Link href={`/shop/${product.Codigo}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.concepto}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <FiPackage className="w-10 h-10" />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <span className="bg-white/90 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded">
              Sin stock
            </span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-[#8B0000] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-tight">
          {product.subrubro}
        </span>
      </Link>

      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="text-[10px] text-gray-400 font-mono">{product.Codigo}</p>
        <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 flex-1">
          {product.concepto}
        </h3>
        <p className="text-xs text-gray-500">{product.marca}</p>

        <div className="flex items-center justify-between mt-1">
          {session ? (
            <span className="text-base font-bold text-[#8B0000]">
              ${product.PrecioFinal.toLocaleString("es-AR")}
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">Solo clientes</span>
          )}
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              inStock ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
            }`}
          >
            {inStock ? product.Stock : "Agotado"}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!inStock}
          className={`mt-2 w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            inStock
              ? "bg-[#8B0000] text-white hover:bg-[#6A0000]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FiShoppingCart className="h-4 w-4" />
          {inStock ? "Agregar" : "Agotado"}
        </button>
      </div>
    </div>
  );
};
