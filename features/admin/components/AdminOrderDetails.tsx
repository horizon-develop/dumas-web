import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import { toast } from "react-hot-toast";
import type { OrderResponse } from "../../order/types/order";
import { isAuthenticated } from "../../auth/utils/authUtils";
import { fetchOrderById } from "../api/orderAdminApi";
import { getErrorMessage } from "../../../shared/types/apiError";

const AdminOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!isAuthenticated()) throw new Error("Acceso no autorizado");

        const orderData = await fetchOrderById(Number(orderId));
        setOrder(orderData);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        toast.error(errorMessage);
        setTimeout(() => navigate("/admin/dashboard/pedidos"), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  const getStatusColor = (state: string) => {
    switch (state) {
      case "COMPLETADO": return "bg-green-100 text-green-800";
      case "EN_PROCESO": return "bg-blue-100 text-blue-800";
      case "PENDIENTE": return "bg-yellow-100 text-yellow-800";
      case "CANCELADO": return "bg-red-100 text-red-800";
      case "ENVIADO": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "dd/MM/yyyy HH:mm") : "Fecha inválida";
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000] mb-4"></div>
      <p className="text-gray-600">Cargando detalles del pedido...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <p className="text-red-500 text-lg mb-4">{error}</p>
      <div className="animate-pulse">
        <p className="text-gray-500 text-sm">Redirigiendo a la lista de pedidos...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#8B0000]">Detalles del Pedido</h1>
          <Link to="/admin/dashboard/pedidos" className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000] transition-colors">
            Volver a Pedidos
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-semibold">Número de Pedido</p>
              <p className="text-gray-600">#{order?.orderNumber}</p>
            </div>
            <div>
              <p className="font-semibold">Fecha del Pedido</p>
              <p className="text-gray-600">{order ? formatDateTime(String(order.orderDate)) : "-"}</p>
            </div>
            <div>
              <p className="font-semibold">Cliente</p>
              <p className="text-gray-600">{order?.address?.fullName}</p>
            </div>
            <div>
              <p className="font-semibold">Estado</p>
              <span className={`px-2 py-1 rounded ${order ? getStatusColor(order.state) : ""}`}>
                {order?.state.toLowerCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold">Provincia</p>
              <p className="text-gray-600">{order?.address?.province}</p>
            </div>
            <div>
              <p className="font-semibold">Ciudad</p>
              <p className="text-gray-600">{order?.address?.city}</p>
            </div>
            <div>
              <p className="font-semibold">Código Postal</p>
              <p className="text-gray-600">{order?.address?.postalCode}</p>
            </div>
            <div>
              <p className="font-semibold">Calle</p>
              <p className="text-gray-600">{order?.address?.street} {order?.address?.streetNumber}</p>
            </div>
            <div>
              <p className="font-semibold">Información Adicional</p>
              <p className="text-gray-600">{order?.address?.additionalInfo}</p>
            </div>
            <div>
              <p className="font-semibold">Método de Pago</p>
              <p className="text-gray-600 capitalize">{order?.paymentMethod}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#8B0000] mb-4">Productos</h3>
            <div className="space-y-4">
              {order?.details.map((detail) => (
                <div key={detail.productId} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{detail.productName}</p>
                          <p className="text-sm text-gray-500">
                            Cantidad: {detail.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(detail.unitPrice * detail.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${detail.unitPrice.toFixed(2)} c/u
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-[#8B0000]">Total:</span>
              <span className="text-xl font-bold text-[#8B0000]">
                ${order?.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;