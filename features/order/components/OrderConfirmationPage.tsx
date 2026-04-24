import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { CheckoutResponse } from '../types/order';
import { getOrderById } from '../api/orderApi';

const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const [order, setOrder] = useState<CheckoutResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stateData = location.state as { orderNumber?: string; orderDate?: string } | null;

    if (stateData?.orderNumber && stateData?.orderDate) {
      setOrder({
        id: Number(orderId),
        orderNumber: stateData.orderNumber,
        orderDate: stateData.orderDate,
      });
      setIsLoading(false);
    } else if (orderId) {
      const fetchOrder = async () => {
        try {
          const orderData = await getOrderById(Number(orderId));
          setOrder({
            id: orderData.id,
            orderNumber: orderData.orderNumber,
            orderDate: orderData.orderDate,
          });
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    } else {
      setIsLoading(false);
    }
  }, [orderId, location.state]);

  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>

          <h2 className="text-2xl font-bold mb-4 text-[#8B0000]">
            ¡Pedido Creado Exitosamente!
          </h2>

          <p className="text-lg mb-2">
            Número de Pedido: {order?.orderNumber}
          </p>

          <p className="text-sm text-gray-600 mb-6">
            Fecha: {order?.orderDate ? formatDate(order.orderDate) : ''}
          </p>

          <div className="mt-8">
            <button
              onClick={() => navigate('/shop')}
              className="bg-[#8B0000] text-white px-6 py-2 rounded hover:bg-[#6A0000] transition-colors"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 