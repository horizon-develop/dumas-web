import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import { motion } from "framer-motion";
import { OrderResponse } from "../../features/order/types/order";
import { isAuthenticated as checkAuth } from "../../features/auth/utils/authUtils";
import { getUserOrders } from "../../features/order/api/orderApi";

type EnrichedOrder = OrderResponse & { productCount?: number };

const Dashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!checkAuth()) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const ordersData = await getUserOrders();

        const processedOrders: EnrichedOrder[] = ordersData.map((order) => ({
          ...order,
          paymentMethod: order.paymentMethod === "cash" ? "Efectivo" : order.paymentMethod || "No especificado",
          productCount: order.details?.length || 0
        }));

        const sortedOrders = processedOrders.sort((a, b) =>
          new Date(a.orderDate).getTime() < new Date(b.orderDate).getTime() ? 1 : -1
        );

        setOrders(sortedOrders);
        setIsAuthenticated(true);

      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login");
        } else {
          setError("Error al cargar los pedidos. Intente nuevamente más tarde.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusColor = (state: string) => {
    switch (state) {
      case "COMPLETADO":
        return "bg-green-100 text-green-800";
      case "EN_PROCESO":
        return "bg-blue-100 text-blue-800";
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      case "ENVIADO":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return isValid(d) ? format(d, "dd/MM/yyyy HH:mm") : "Fecha inválida";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            Debes iniciar sesión para poder ver tus pedidos.
          </p>
          <Link
            to="/login"
            className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000] transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-lg">{error}</p>
        <Link to="/" className="mt-4 inline-block text-red-600 hover:text-red-700">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const currentOrders = orders.filter((order) => order.state !== "COMPLETADO");
  const orderHistory = orders.filter((order) => order.state === "COMPLETADO");

  const formatStateLabel = (state: string) => state.replace(/_/g, " ").toLowerCase();

  const renderOrderCard = (order: EnrichedOrder, index: number, accent: "red" | "emerald" = "red") => {
    const accentColor = accent === "red" ? "red" : "emerald";
    return (
      <motion.div
        key={order.id}
        className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg transition-all"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.06 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-semibold text-red-600">#{order.orderNumber}</p>
            <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(order.state)}`}>
            {formatStateLabel(order.state)}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-lg font-bold text-red-600">${order.totalAmount.toFixed(2)}</p>
          <p className="text-sm text-gray-700 font-medium truncate">
            {order.productCount || 0} productos en el pedido
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p><span className="font-semibold">Pago:</span> {order.paymentMethod}</p>
            {order.address?.city && (
              <p>
                <span className="font-semibold">Envía a:</span> {order.address.city}{order.address.province ? `, ${order.address.province}` : ""}
              </p>
            )}
          </div>
        </div>

        <Link
          to={`/order/${order.id}`}
          className={`w-full inline-block text-center bg-${accentColor}-50 text-${accentColor}-700 hover:bg-${accentColor}-100 px-4 py-2 rounded-lg transition-colors`}
        >
          Ver Detalles
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center"
        >
          <h1 className="text-3xl font-bold text-red-600">Mis Pedidos</h1>
          <Link
            to="/shop"
            className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000] transition-colors w-full sm:w-auto text-center"
          >
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Seguir Comprando
            </motion.span>
          </Link>
        </motion.div>

        {/* Pedidos Actuales */}
        <div className="mb-12 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold text-red-600 mb-6 border-b-2 border-red-100 pb-4">
            🚚 Pedidos en Proceso
          </h2>
          {currentOrders.length === 0 ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-center p-8 bg-gray-50 rounded-lg"
            >
              <p className="text-gray-600 text-lg mb-4">
                {orders.length === 0 ? (
                  <>
                    🛍️ ¡Aún no tienes pedidos!
                    <br />
                    <Link
                      to="/shop"
                      className="text-red-600 hover:text-red-700 underline mt-2 inline-block"
                    >
                      Empieza a comprar ahora
                    </Link>
                  </>
                ) : (
                  "🎉 ¡Todos tus pedidos están en camino!"
                )}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentOrders.map((order, index) => renderOrderCard(order, index, "red"))}
            </div>
          )}
        </div>

        {/* Historial de Pedidos */}
        {orderHistory.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-600 mb-6 border-b-2 border-gray-100 pb-4">
              📦 Historial de Pedidos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderHistory.map((order, index) => renderOrderCard(order, index, "emerald"))}
            </div>
          </div>
        ) : (
          orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <p className="text-gray-600 text-lg mb-4">
                📭 Aún no tienes pedidos entregados
              </p>
              <p className="text-sm text-gray-500">
                ¡Pronto verás aquí tus pedidos completados!
              </p>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
