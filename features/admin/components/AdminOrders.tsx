import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { OrderResponse } from "../../order/types/order";
import { OrderState } from "../../order/types/orderState";
import { formatDate } from "../../../shared/utils/formatters";
import { fetchAllOrders, updateOrderStatus } from "../api/orderAdminApi";

const PAGE_SIZE = 10;

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLast, setIsLast] = useState(true);

  const loadOrders = useCallback(async (page: number) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetchAllOrders(page, PAGE_SIZE);
      setOrders(response.orders);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setIsLast(response.last);
    } catch {
      setError("Error al cargar los pedidos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(0);
  }, [loadOrders]);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      loadOrders(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (!isLast) {
      loadOrders(currentPage + 1);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, state: newStatus as OrderState } : order
        )
      );
    } catch {
      setError("Error al actualizar el estado del pedido");
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="h-12 w-12 border-4 border-[#8B0000] border-t-transparent rounded-full"
      />
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <p className="text-red-500 text-lg mb-4">{error}</p>
      <button
        onClick={() => loadOrders(currentPage)}
        className="text-[#8B0000] hover:text-[#6A0000] underline"
      >
        Intentar nuevamente
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-[#8B0000]">Gestión de Pedidos</h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalElements} pedido{totalElements !== 1 ? "s" : ""} en total
            </p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar por ID o numero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-white"
            >
              <h2 className="text-lg font-semibold text-gray-700">No hay pedidos</h2>
              <p className="text-gray-500 mt-1">
                {searchTerm
                  ? "No se encontraron pedidos con ese criterio de búsqueda."
                  : "Aun no hay pedidos registrados en el sistema."}
              </p>
            </motion.div>
          ) : (
          <div className="grid gap-2">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 items-center">
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-medium">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Numero</p>
                    <p className="font-medium truncate">{order.orderNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{formatDate(order.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Método</p>
                    <p className="font-medium truncate">{order.paymentMethod || "-"}</p>
                  </div>
                  <div className="relative">
                    <select
                      value={order.state}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="w-full p-2 bg-white border rounded-lg appearance-none focus:ring-2 focus:ring-[#8B0000]"
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROCESO">En proceso</option>
                      <option value="ENVIADO">Enviado</option>
                      <option value="COMPLETADO">Completado</option>
                      <option value="CANCELADO">Cancelado</option>
                      <option value="ABONADO">Abonado</option>
                    </select>
                    <div className="absolute inset-y-0 right-2 flex items-center px-2 pointer-events-none">
                      <svg className="w-5 h-5 text-[#8B0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} className="sm:col-span-1">
                    <Link
                      to={`/admin/dashboard/pedidos/${order.id}`}
                      className="flex items-center justify-center gap-2 bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000]"
                    >
                      <span>Detalles</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-[#8B0000] bg-white text-[#8B0000] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#8B0000] hover:text-white transition-colors"
              aria-label="Pagina anterior"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="text-gray-600">Pagina</span>
              <span className="text-[#8B0000]">{currentPage + 1}</span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">{totalPages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={isLast}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-[#8B0000] bg-white text-[#8B0000] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#8B0000] hover:text-white transition-colors"
              aria-label="Pagina siguiente"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
