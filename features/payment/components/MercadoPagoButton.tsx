import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMercadoPago } from '../api/MercadoPagoContext';
import { createMercadoPagoPreference } from '../api/mercadoPagoApi';
import type { CheckoutRequest } from '../../order/types/order';
import '../../../shared/types/window.d';
import { getErrorMessage } from '../../../shared/types/apiError';

interface MercadoPagoButtonProps {
  isDisabled?: boolean;
  getCheckoutData: () => Promise<CheckoutRequest | null>;
}

const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({ isDisabled = false, getCheckoutData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const { setIsProcessing, setPreferenceId } = useMercadoPago();

  useEffect(() => {
    if (!window.MercadoPago) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => setSdkLoaded(true);
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else {
      setSdkLoaded(true);
    }
  }, []);

  const handlePayment = async () => {
    if (isDisabled || isLoading) return;

    setIsLoading(true);
    setIsProcessing(true);

    try {      
      const checkoutData = await getCheckoutData();
      if (!checkoutData) {
        setIsProcessing(false);
        return;
      }

      const preferenceData = await createMercadoPagoPreference(checkoutData);
      setPreferenceId(preferenceData.preferenceId);

      if (sdkLoaded && preferenceData.preferenceId) {
        new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, {
          locale: 'es-AR'
        });
        
        window.location.href = preferenceData.initPoint;
      } else {
        toast.error('Error al inicializar Mercado Pago');
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsProcessing(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={isDisabled || isLoading}
        className={`w-full py-4 rounded-lg flex items-center justify-center transition-colors ${
          isDisabled || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#fee600] hover:bg-[#e6cf00]'
        }`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#0A0080]"></div>
        ) : (
          <img
            src="/assets/icons/payment-methods/mercado-pago-wordmark.svg"
            alt="Mercado Pago"
            className="h-8"
          />
        )}
      </button>
    </div>
  );
};

export default MercadoPagoButton;
