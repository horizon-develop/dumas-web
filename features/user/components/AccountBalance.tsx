import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiInfo } from 'react-icons/fi';
import { getCurrentDebt } from '../api/userApi';

interface CurrentDebtProps {
  orderTotal: number;
  isSelected: boolean;
  onDebtLoad?: (currentDebt: number) => void;
}

const CurrentDebt: React.FC<CurrentDebtProps> = ({
  orderTotal,
  isSelected,
  onDebtLoad
}) => {
  const [currentDebt, setCurrentDebt] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSelected) {
      loadDebt();
    }
  }, [isSelected]);

  const loadDebt = async () => {
    try {
      setLoading(true);
      const debt = await getCurrentDebt();
      setCurrentDebt(debt);
      onDebtLoad?.(debt);
    } catch (error: any) {
      setCurrentDebt(0);
      onDebtLoad?.(0);
    } finally {
      setLoading(false);
    }
  };

  if (!isSelected) return null;

  const newTotalDebt = currentDebt + orderTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <FiDollarSign className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            Deuda actual de cuenta corriente
            <FiInfo className="w-4 h-4 ml-2 text-blue-500" title="Tu deuda actual" />
          </h4>
          
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Cargando información de cuenta...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Deuda actual:</span>
                  <p className="text-lg font-bold text-blue-900">
                    ${currentDebt.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <span className="text-blue-600 font-medium">Total del pedido:</span>
                  <p className="text-lg font-bold text-gray-900">
                    ${orderTotal.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-blue-200">
                <div className="text-gray-700">
                  <span className="text-sm">
                    <strong>Deuda total después del pedido:</strong> ${newTotalDebt.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-white/60 rounded border border-blue-100">
                <p className="text-xs text-blue-700">
                  <strong>Nota:</strong> Este pedido se registrará como cuenta corriente. El total se sumará a tu deuda actual y deberás coordinar el pago con Dumas Distribuciones.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CurrentDebt;