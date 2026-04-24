import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format, isValid } from "date-fns";
import type { OrderResponse } from "../types/order";
import { getOrderById } from "../api/orderApi";

const Order: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderData = await getOrderById(Number(orderId));
        setOrder({
          ...orderData,
          paymentMethod: orderData.paymentMethod || "No especificado",
        });
      } catch (error) {
        setError("Error al cargar los detalles del pedido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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

  const buildAddress = () => {
    if (!order) return null;
    
    return (
      <div className="space-y-1.5">
        {/* Línea 1: Calle y número */}
        <p className="font-medium text-gray-800">
          {order.address?.street} {order.address?.streetNumber}
        </p>

        {/* Línea 2: Ciudad y código postal */}
        <p className="text-gray-600">
          {order.address?.city}
          {order.address?.postalCode && `, CP: ${order.address.postalCode}`}
        </p>

        {/* Línea 3: Provincia */}
        <p className="text-gray-600">
          {order.address?.province}
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-lg">{error}</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block text-[#8B0000] hover:text-[#6A0000]"
        >
          Volver al dashboard
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 text-lg">Pedido no encontrado</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block text-[#8B0000] hover:text-[#6A0000]"
        >
          Volver al dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#8B0000]">
            Detalles del Pedido
          </h1>
          <Link
            to="/dashboard"
            className="mt-2 inline-block text-[#8B0000] hover:text-[#6A0000]"
          >
            ← Volver a mis pedidos
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-semibold">Número de pedido:</p>
              <p className="text-gray-600">{order.orderNumber}</p>
            </div>
            <div>
              <p className="font-semibold">Fecha:</p>
              <p className="text-gray-600">
                {isValid(new Date(order.orderDate))
                  ? format(new Date(order.orderDate), "d/M/yyyy HH:mm")
                  : "Fecha inválida"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Estado:</p>
              <span className={`px-2 py-1 rounded ${getStatusColor(order.state)}`}>
                {order.state.toLowerCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold">Cliente:</p>
              <p className="text-gray-600">{order.address?.fullName}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#8B0000] mb-3">
              Dirección de envío
            </h3>
            <div className="text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-100">
              {buildAddress()}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#8B0000] mb-2">
              Método de pago
            </h3>
            <p className="text-gray-600 capitalize">{order.paymentMethod}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#8B0000] mb-4">
              Productos
            </h3>
            <div className="space-y-4">
              {order.details.map((detail) => (
                <div
                  key={detail.productId}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
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
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-[#8B0000]">
                Total del pedido:
              </span>
              <span className="text-xl font-bold text-[#8B0000]">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            to="/contacto"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            Contactar soporte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Order;