import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import PaymentStatus from './PaymentStatus';

const PaymentStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [statusMessage, setStatusMessage] = useState('Procesando tu pago...');
  const [statusTitle, setStatusTitle] = useState('Estado del Pago');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');

    if (status === 'approved') {
      setStatusTitle('¡Pago Aprobado!');
      setStatusMessage('Estamos confirmando tu compra y generando tu orden...');
    } else if (status === 'pending') {
      setStatusTitle('Pago Pendiente');
      setStatusMessage('Tu pago está siendo procesado y será confirmado en breve.');
    } else if (status === 'rejected') {
      setStatusTitle('Pago Rechazado');
      setStatusMessage('Lo sentimos, tu pago fue rechazado. Por favor intenta nuevamente con otro método de pago.');
    }
  }, [location.search]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center gap-4">
        <FiArrowLeft
          onClick={() => navigate('/shop')}
          className="text-2xl text-[#8B0000] cursor-pointer hover:text-[#6A0000]"
        />
        <h1 className="text-3xl font-bold text-[#8B0000]">
          {statusTitle}
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <p className="text-lg">{statusMessage}</p>
        </div>

        <PaymentStatus />

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#8B0000] text-white px-6 py-2 rounded hover:bg-[#6A0000] transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage; 