import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiTrash2, FiShoppingCart, FiPackage, FiCheck } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { isAuthenticated } from "../../auth/utils/authUtils";
import { getErrorMessage } from "../../../shared/types/apiError";

const CartPage: React.FC = () => {
  const { items, total, updateItemQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handler = () => {
      toast.error("Tu sesión expiró. Inicia sesión para continuar con el pedido.", {
        position: "top-right",
      });
      window.dispatchEvent(new Event("auth-open-login"));
    };
    window.addEventListener("auth-logout", handler);
    return () => window.removeEventListener("auth-logout", handler);
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.productId));
    }
  };

  const handleRemoveSelected = async () => {
    if (!selectedIds.length) {
      toast("Selecciona productos para eliminar", { position: "top-right", duration: 2200 });
      return;
    }
    setIsProcessing(true);
    try {
      await Promise.all(selectedIds.map(id => removeItem(id)));
      setSelectedIds([]);
      toast.success("Productos eliminados", { position: "top-right", duration: 2200 });
    } catch (error) {
      toast.error(getErrorMessage(error), { position: "top-right", duration: 2500 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = async () => {
    if (!items.length) {
      toast("El carrito ya está vacío", { position: "top-right", duration: 2200 });
      return;
    }
    setIsProcessing(true);
    try {
      await clearCart();
      setSelectedIds([]);
      toast.success("Carrito vaciado", { position: "top-right", duration: 2200 });
    } catch (error) {
      toast.error(getErrorMessage(error), { position: "top-right", duration: 2500 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated()) {
      toast.error("Tu sesión expiró. Inicia sesión para continuar con el checkout.", {
        position: "top-right",
      });
      window.dispatchEvent(new Event("auth-open-login"));
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff5f5] via-white to-[#fff0f0] p-4 sm:p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-red-700 hover:text-red-800 font-semibold"
            >
              <FiArrowLeft className="text-xl" />
              Volver
            </button>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-md border border-red-100 rounded-2xl shadow-xl p-8 sm:p-10 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
              <FiShoppingCart className="text-3xl text-red-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-red-700 mb-2">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Explora nuestros productos y agrega lo que necesites. Tu selección aparecerá aquí.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#8B0000] text-white font-semibold shadow-md hover:bg-[#6A0000] transition-colors"
            >
              <FiPackage />
              Ir a la tienda
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
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-red-700 hover:text-red-800 font-semibold"
            >
              <FiArrowLeft className="text-xl" />
              Volver
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiPackage className="text-red-600" />
              <span>{items.length} producto{items.length !== 1 ? 's' : ''} en el carrito</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.8fr_1fr] gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {selectedIds.length === items.length ? "Borrar selección" : "Seleccionar todo"}
              </button>
              {showClearConfirm ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRemoveSelected}
                    disabled={isProcessing || selectedIds.length === 0}
                    className="px-3 py-1.5 rounded-full border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Eliminar seleccionados ({selectedIds.length})
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={isProcessing || items.length === 0}
                    className="px-3 py-1.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            {items.map((i) => (
              <motion.div
                key={String(i.productId)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => toggleSelect(i.productId)}
                className="relative bg-white/90 backdrop-blur border border-red-100 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {selectedIds.includes(i.productId) && (
                  <div className="absolute -top-2 -left-2 h-7 w-7 rounded-full bg-[#b40000] flex items-center justify-center shadow-md transition-transform duration-150 scale-105">
                    <FiCheck className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  <img
                    src={i.urlImage || "/placeholder-product.png"}
                    alt={i.productName}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-red-100"
                  />
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-gray-800">{i.productName}</h2>
                  <p className="text-sm font-semibold text-red-700">
                    ${i.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

                <div className="flex items-center justify-end gap-4 w-full sm:w-auto">
                  <div className="flex items-center bg-red-50 rounded-full border border-red-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateItemQty(i.productId, i.quantity - 1);
                      }}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-100 rounded-l-full transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 text-gray-800 font-semibold">{i.quantity}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateItemQty(i.productId, i.quantity + 1);
                      }}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-100 rounded-r-full transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[110px] pr-2">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="text-lg font-bold text-red-700">
                      ${(i.unitPrice * i.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(i.productId);
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
            transition={{ duration: 0.25 }}
            className="bg-white/90 backdrop-blur border border-red-100 rounded-2xl shadow-xl p-5 sm:p-6 h-fit"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Productos</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total parcial</span>
                <span className="font-semibold text-red-700">
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Los costos de envío e impuestos se calculan en el checkout.
              </p>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full mt-4 py-3 rounded-lg bg-[#8B0000] text-white font-semibold shadow-md hover:bg-[#6A0000] transition-colors"
            >
              Proceder al pago
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
