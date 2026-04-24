import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMercadoPago } from '../api/MercadoPagoContext';
import { getPaymentStatus, processSuccessfulPayment } from '../api/mercadoPagoApi';


const PaymentStatus: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    setPaymentStatus,
    setPaymentId,
    resetPaymentState
  } = useMercadoPago();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const paymentId = queryParams.get('payment_id');
    const preferenceIdFromUrl = queryParams.get('preference_id');

    if (!status || !paymentId || !preferenceIdFromUrl) {
      setError('Información de pago incompleta');
      setIsLoading(false);
      setTimeout(() => navigate('/checkout'), 3000);
      return;
    }

    const handlePaymentResult = async () => {
      try {
        setIsLoading(true);
        setPaymentId(paymentId);

        const paymentData = await getPaymentStatus(paymentId);

        if (status === 'approved' && paymentData.status === 'APPROVED') {
          setPaymentStatus('success');

          try {
            const orderResult = await processSuccessfulPayment({
              paymentId,
              preferenceId: preferenceIdFromUrl,
              status: status
            });

            toast.success(
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
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
                <span>Pago exitoso!{orderResult.orderNumber}</span>
              </div>
            );

            navigate(`/order-confirmation/${orderResult.orderId}`, {
              state: orderResult.orderNumber && orderResult.orderDate ? {
                orderNumber: orderResult.orderNumber,
                orderDate: orderResult.orderDate,
              } : undefined
            });
          } catch (confirmError) {
            toast('Pago registrado pero hubo un problema generando la orden. Revise sus órdenes.', {
              icon: "ℹ️",
              position: "top-right",
            });
            navigate('/orders');
          }
        } else if (status === 'pending' || paymentData.status === 'PENDING') {
          setPaymentStatus('pending');
          toast('Tu pago está pendiente de confirmación', {
            icon: "ℹ️",
            position: "top-right",
          });
          setTimeout(() => navigate('/orders'), 2000);
        } else {
          setPaymentStatus('failure');
          toast.error('El pago no pudo ser procesado');
          setTimeout(() => navigate('/checkout'), 2000);
        }
      } catch (error) {
        setError('Error al verificar el estado del pago');
        setPaymentStatus('failure');
        setTimeout(() => navigate('/checkout'), 3000);
      } finally {
        setIsLoading(false);
        resetPaymentState();
      }
    };

    handlePaymentResult();
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000] mb-4"></div>
        <h2 className="text-xl font-semibold">Procesando tu pago...</h2>
        <p className="text-gray-600 mt-2">Por favor, no cierres esta ventana.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-red-600">{error}</h2>
        <p className="text-gray-600 mt-2">Redirigiendo...</p>
      </div>
    );
  }

  return null;
};

export default PaymentStatus; 
