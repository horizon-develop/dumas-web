import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MercadoPagoContextType {
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  paymentStatus: 'pending' | 'success' | 'failure' | null;
  setPaymentStatus: (status: 'pending' | 'success' | 'failure' | null) => void;
  paymentId: string | null;
  setPaymentId: (id: string | null) => void;
  preferenceId: string | null;
  setPreferenceId: (id: string | null) => void;
  orderData: Record<string, unknown> | null;
  setOrderData: (data: Record<string, unknown> | null) => void;
  resetPaymentState: () => void;
}

const MercadoPagoContext = createContext<MercadoPagoContextType | undefined>(undefined);

export const useMercadoPago = () => {
  const context = useContext(MercadoPagoContext);
  if (!context) {
    throw new Error('useMercadoPago must be used within a MercadoPagoProvider');
  }
  return context;
};

interface MercadoPagoProviderProps {
  children: ReactNode;
}

export const MercadoPagoProvider: React.FC<MercadoPagoProviderProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failure' | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<Record<string, unknown> | null>(null);

  const resetPaymentState = () => {
    setIsProcessing(false);
    setPaymentStatus(null);
    setPaymentId(null);
    setPreferenceId(null);
    setOrderData(null);
  };

  const value = {
    isProcessing,
    setIsProcessing,
    paymentStatus,
    setPaymentStatus,
    paymentId,
    setPaymentId,
    preferenceId,
    setPreferenceId,
    orderData,
    setOrderData,
    resetPaymentState,
  };

  return (
    <MercadoPagoContext.Provider value={value}>
      {children}
    </MercadoPagoContext.Provider>
  );
}; 