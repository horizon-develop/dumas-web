import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiHome,
  FiEdit2,
  FiArrowLeft
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getUserAddresses, createAddress, deleteAddress, updateAddress } from '../../address/api/addressApi';
import { Address } from '../../address/types/address';
import { AddressResponse, CreateAddressRequest } from '../../address/types/addressDto';
import { isAuthenticated } from '../../auth/utils/authUtils';
import { getErrorMessage } from '../../../shared/types/apiError';

interface AddressManagerProps {
  onBack: () => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({ onBack }) => {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<AddressResponse | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      if (!isAuthenticated()) {
        toast.error("Tu sesión expiró. Inicia sesión para gestionar tus direcciones.");
        window.dispatchEvent(new Event("auth-open-login"));
        return;
      }
      setIsLoading(true);
      const data = await getUserAddresses();
      setAddresses(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async (address: Address) => {
    try {
      if (!isAuthenticated()) {
        toast.error('Tu sesión expiró. Inicia sesión para guardar direcciones.');
        window.dispatchEvent(new Event("auth-open-login"));
        return;
      }

      const addressDTO: CreateAddressRequest = {
        fullName: address.fullName || '',
        country: address.country || '',
        province: address.province || '',
        city: address.city || '',
        postalCode: address.postalCode || null,
        street: address.street || '',
        streetNumber: address.streetNumber || '',
        additionalInfo: address.additionalInfo || null,
        label: address.label || "Casa",
      };

      if (editingAddress?.id) {
        await updateAddress(editingAddress.id, addressDTO);
        toast.success('Dirección actualizada exitosamente');
      } else {
        await createAddress(addressDTO);
        toast.success('Dirección guardada exitosamente');
      }

      await loadAddresses();
      setShowForm(false);
      setEditingAddress(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      if (!isAuthenticated()) {
        toast.error('Tu sesión expiró. Inicia sesión para eliminar direcciones.');
        window.dispatchEvent(new Event("auth-open-login"));
        return;
      }

      await deleteAddress(id);
      toast.success('Dirección eliminada');
      await loadAddresses();
      setAddressToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEditClick = (address: AddressResponse) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleNewAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-[#8B0000] hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B0000]/80">Gestión</p>
            <h1 className="text-xl font-bold text-[#8B0000] flex items-center gap-2">
              <FiMapPin className="w-5 h-5" />
              Mis Direcciones
            </h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B0000]"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          {!showForm ? (
            <>
              <button
                onClick={handleNewAddress}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#8B0000] hover:text-[#8B0000] hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                <span className="font-medium">Agregar nueva dirección</span>
              </button>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <FiMapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tienes direcciones guardadas</p>
                  <p className="text-sm text-gray-400 mt-1">Agrega tu primera dirección para usarla en tus pedidos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <motion.div
                      key={address.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-gray-100 rounded-lg text-gray-600">
                          <FiHome className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{address.fullName}</h4>
                            {address.label && (
                              <span className="text-xs font-medium text-[#8B0000] bg-red-50 px-2 py-0.5 rounded">
                                {address.label}
                              </span>
                            )}
                            {address.isDefault && (
                              <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                                Predeterminada
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.street} {address.streetNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {address.city}, {address.province}
                          </p>
                          {address.postalCode && (
                            <p className="text-xs text-gray-400 mt-1">CP: {address.postalCode}</p>
                          )}
                          {address.additionalInfo && (
                            <p className="text-xs text-gray-400 mt-1 italic">{address.additionalInfo}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(address)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setAddressToDelete(address)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <AddressForm
              address={editingAddress}
              onSave={handleSaveAddress}
              onCancel={() => {
                setShowForm(false);
                setEditingAddress(null);
              }}
              isEditing={!!editingAddress}
            />
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {addressToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-700">Eliminar dirección</h3>
                <button
                  onClick={() => setAddressToDelete(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar la dirección <strong>{addressToDelete.label || addressToDelete.fullName}</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAddressToDelete(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteAddress(addressToDelete.id)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AddressFormProps {
  address: AddressResponse | null;
  onSave: (address: Address) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState<Address>(() => {
    if (address) {
      return {
        id: address.id,
        fullName: address.fullName,
        country: address.country,
        province: address.province,
        city: address.city,
        postalCode: address.postalCode || '',
        street: address.street,
        streetNumber: address.streetNumber || '',
        additionalInfo: address.additionalInfo || '',
        label: address.label || 'Casa',
      };
    }
    return {
      fullName: '',
      country: 'Argentina',
      province: '',
      city: '',
      postalCode: '',
      street: '',
      streetNumber: '',
      additionalInfo: '',
      label: 'Casa',
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const validateField = (field: keyof Address, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 3) return 'Mínimo 3 caracteres';
        break;
      case 'country':
        if (!value.trim()) return 'El país es requerido';
        break;
      case 'province':
        if (!value.trim()) return 'La provincia es requerida';
        break;
      case 'city':
        if (!value.trim()) return 'La ciudad es requerida';
        break;
      case 'street':
        if (!value.trim()) return 'La calle es requerida';
        break;
      case 'streetNumber':
        if (!value.trim()) return 'El número es requerido';
        break;
      case 'postalCode':
        if (value && !/^\d{4,8}$/.test(value)) return 'Código postal inválido (4-8 dígitos)';
        break;
    }
    return undefined;
  };

  const handleChange = (field: keyof Address, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = () => {
    const newErrors: Partial<Record<keyof Address, string>> = {};
    let hasErrors = false;

    (['fullName', 'country', 'province', 'city', 'street', 'streetNumber'] as const).forEach(field => {
      const error = validateField(field, formData[field] || '');
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    if (formData.postalCode) {
      const postalError = validateField('postalCode', formData.postalCode);
      if (postalError) {
        newErrors.postalCode = postalError;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    onSave(formData);
  };

  const isFormValid = () => {
    return formData.fullName && formData.country && formData.province &&
           formData.city && formData.street && formData.streetNumber;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {isEditing ? 'Editar Dirección' : 'Nueva Dirección'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Etiqueta (Casa, Trabajo, etc.)"
            value={formData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Nombre completo *"
            value={formData.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B0000] ${
              errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="País *"
              value={formData.country || ''}
              onChange={(e) => handleChange('country', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B0000] ${
                errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Provincia *"
              value={formData.province || ''}
              onChange={(e) => handleChange('province', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B0000] ${
                errors.province ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="Ciudad *"
              value={formData.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B0000] ${
                errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Código Postal"
              value={formData.postalCode || ''}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B0000] ${
                errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="Calle *"
              value={formData.street || ''}
              onChange={(e) => handleChange('street', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B0000] ${
                errors.street ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Número *"
              value={formData.streetNumber || ''}
              onChange={(e) => handleChange('streetNumber', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B0000] ${
                errors.streetNumber ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.streetNumber && <p className="text-red-500 text-xs mt-1">{errors.streetNumber}</p>}
          </div>
        </div>

        <div>
          <textarea
            placeholder="Información adicional (opcional)"
            value={formData.additionalInfo || ''}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
            rows={2}
          />
        </div>

        <p className="text-xs text-gray-500">* Campos requeridos</p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              isFormValid()
                ? 'bg-[#8B0000] text-white hover:bg-[#6A0000]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FiCheck className="w-5 h-5" />
            {isEditing ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddressManager;