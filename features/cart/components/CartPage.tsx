"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiTrash2, FiShoppingCart, FiPackage, FiCheck } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";

const CartPage: React.FC = () => {
  const { items, total, updateQty, removeItem, clearCart } = useCart();
  const router = useRouter();
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleSelect = (sku: string) => {
    setSelectedSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  };

  const selectAll = () => {
    if (selectedSkus.length === items.length) {
      setSelectedSkus([]);
    } else {
      setSelectedSkus(items.map((i) => i.sku));
    }
  };

  const handleRemoveSelected = () => {
    if (!selectedSkus.length) {
      toast("Selecciona productos para eliminar");
      return;
    }
    selectedSkus.forEach((sku) => removeItem(sku));
    setSelectedSkus([]);
    toast.success("Productos eliminados");
  };

  const handleClearAll = () => {
    clearCart();
    setSelectedSkus([]);
    setShowClearConfirm(false);
    toast.success("Carrito vaciado");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff5f5] via-white to-[#fff0f0] p-4 sm:p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-red-700 hover:text-red-800 font-semibold mb-8"
          >
            <FiArrowLeft className="text-xl" />
            Volver
          </button>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-md border border-red-100 rounded-2xl shadow-xl p-8 sm:p-10 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
              <FiShoppingCart className="text-3xl text-red-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-red-700 mb-2">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Explorá el catálogo y agregá lo que necesités.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#8B0000] text-white font-semibold shadow-md hover:bg-[#6A0000] transition-colors"
            >
              <FiPackage />
              Ir al catálogo
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5f5] via-white to-[#fff0f0] p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-red-700 hover:text-red-800 font-semibold"
            >
              <FiArrowLeft className="text-xl" />
              Volver
            </button>
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <FiPackage className="text-red-600" />
              {items.length} producto{items.length !== 1 ? "s" : ""} en el carrito
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.8fr_1fr] gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {selectedSkus.length === items.length
                  ? "Borrar selección"
                  : "Seleccionar todo"}
              </button>
              {showClearConfirm ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRemoveSelected}
                    disabled={selectedSkus.length === 0}
                    className="px-3 py-1.5 rounded-full border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Eliminar seleccionados ({selectedSkus.length})
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Vaciar todos
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-1.5 rounded-full border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50 transition-all"
                >
                  Vaciar carrito
                </button>
              )}
            </div>

            {items.map((item) => (
              <motion.div
                key={item.sku}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => toggleSelect(item.sku)}
                className="relative bg-white/90 backdrop-blur border border-red-100 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {selectedSkus.includes(item.sku) && (
                  <div className="absolute -top-2 -left-2 h-7 w-7 rounded-full bg-[#b40000] flex items-center justify-center shadow-md">
                    <FiCheck className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-red-100"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-red-100 bg-gray-50 flex items-center justify-center">
                      <FiPackage className="text-gray-300 text-2xl" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                    <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                    <p className="text-sm font-semibold text-red-700">
                      ${item.price.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 w-full sm:w-auto">
                  <div className="flex items-center bg-red-50 rounded-full border border-red-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQty(item.sku, item.quantity - 1);
                      }}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-100 rounded-l-full transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 text-gray-800 font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQty(item.sku, item.quantity + 1);
                      }}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-100 rounded-r-full transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[110px] pr-2">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="text-lg font-bold text-red-700">
                      ${(item.price * item.quantity).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.sku);
                    }}
                    className="h-10 px-4 rounded-md bg-[#b40000] text-white flex items-center justify-center shadow hover:bg-[#8f0000] transition-colors"
                    aria-label="Eliminar producto"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur border border-red-100 rounded-2xl shadow-xl p-5 sm:p-6 h-fit"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Productos</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-semibold text-red-700">
                  ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full mt-4 py-3 rounded-lg bg-[#8B0000] text-white font-semibold shadow-md hover:bg-[#6A0000] transition-colors text-center"
            >
              Proceder al pedido
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
