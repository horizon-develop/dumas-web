import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiHome,
  FiEdit2
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getUserAddresses, createAddress, deleteAddress, updateAddress } from '../../address/api/addressApi';
import { Address } from '../../address/types/address';
import { AddressResponse, CreateAddressRequest } from '../../address/types/addressDto';
import type { User } from '../types/user';
import { isAuthenticated } from '../../auth/utils/authUtils';
import { getErrorMessage } from '../../../shared/types/apiError';

interface AddressSelectorProps {
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  onAddressChange: (field: keyof Address, value: string) => void;
  showSaveOption?: boolean;
  currentUser?: User | null;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddress,
  onAddressSelect,
  onAddressChange,
  showSaveOption = true,
  currentUser
}) => {
  const [savedAddresses, setSavedAddresses] = useState<AddressResponse[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<AddressResponse | null>(null);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  useEffect(() => {
    if (!hasAutoLoaded && !selectedAddress && currentUser && savedAddresses.length === 0) {
      const defaultAddress: Address = {
        fullName: currentUser.name || currentUser.clientDetails?.legalCompanyName || "",
        country: "Argentina",
        province: "",
        city: "",
        postalCode: "",
        street: "",
        streetNumber: "",
        additionalInfo: "",
        label: "Casa"
      };

      onAddressSelect(defaultAddress);
      setHasAutoLoaded(true);
    }
  }, [currentUser, selectedAddress, savedAddresses.length, onAddressSelect, hasAutoLoaded]);

  const loadSavedAddresses = async () => {
    try {
      if (!isAuthenticated()) {
        toast.error("Tu sesión expiró. Inicia sesión para gestionar tus direcciones.", {
          position: "top-right",
        });
        window.dispatchEvent(new Event("auth-open-login"));
        return;
      }
      setIsLoadingAddresses(true);
      const addresses = await getUserAddresses();
      setSavedAddresses(addresses);
      
      if (!selectedAddress && addresses.length > 0) {
        const defaultAddress = addresses[0];
        onAddressSelect({
          id: defaultAddress.id,
          fullName: defaultAddress.fullName,
          country: defaultAddress.country,
          province: defaultAddress.province,
          city: defaultAddress.city,
          postalCode: defaultAddress.postalCode || undefined,
          street: defaultAddress.street,
          streetNumber: defaultAddress.streetNumber || undefined,
          additionalInfo: defaultAddress.additionalInfo || undefined,
          label: defaultAddress.label || "Casa",
        });
        setShowSavedAddresses(true);
      }
    } catch (error) {
      setShowSavedAddresses(false);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleSaveAddress = async (address: Address) => {
    try {
      if (!isAuthenticated()) {
        toast.error('Tu sesión expiró. Inicia sesión para guardar direcciones.', { position: "top-right" });
        window.dispatchEvent(new Event("auth-open-login"));
        return;
      }

      if (!address.fullName || !address.country || !address.province || !address.city || !address.street || !address.streetNumber) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }

      const addressDTO: CreateAddressRequest = {
        fullName: address.fullName,
        country: address.country,
        province: address.province,
        city: address.city,
        postalCode: address.postalCode || null,
        street: address.street,
        streetNumber: address.streetNumber,
        additionalInfo: address.additionalInfo || null,
        label: address.label || "Casa",
      };

      const isEditing = editingAddress !== null && editingAddress.id;
      const savedAddress = isEditing
        ? await updateAddress(editingAddress.id, addressDTO)
        : await createAddress(addressDTO);
      
      toast.success(isEditing ? '✅ Dirección actualizada exitosamente' : '✅ Dirección guardada exitosamente');
      
      await loadSavedAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      
      setShowSavedAddresses(true);
      
      onAddressSelect({
        id: savedAddress.id,
        fullName: savedAddress.fullName,
        country: savedAddress.country,
        province: savedAddress.province,
        city: savedAddress.city,
        postalCode: savedAddress.postalCode || undefined,
        street: savedAddress.street,
        streetNumber: savedAddress.streetNumber || undefined,
        additionalInfo: savedAddress.additionalInfo || undefined,
        label: savedAddress.label || "Casa",
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      if (!isAuthenticated()) {
        toast.error('Tu sesión expiró. Inicia sesión para eliminar direcciones.', { position: "top-right" });
        window.dispatchEvent(new Event("auth-open-login"));
        return;
      }

      await deleteAddress(id);
      toast.success('🗑️ Dirección eliminada');
      await loadSavedAddresses();
      
      if (selectedAddress && 'id' in selectedAddress && selectedAddress.id === id) {
        onAddressSelect({
          fullName: currentUser?.name || "",
          country: "Argentina",
          province: "",
          city: "",
          postalCode: undefined,
          street: "",
          streetNumber: undefined,
          additionalInfo: undefined,
          label: "Casa"
        });
      }
      
      setAddressToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAddressCardSelect = (address: AddressResponse) => {
    if (!isAuthenticated()) {
      toast.error("Tu sesión expiró. Inicia sesión para continuar.", { position: "top-right" });
      window.dispatchEvent(new Event("auth-open-login"));
      return;
    }

    onAddressSelect({
      id: address.id,
      fullName: address.fullName,
      country: address.country,
      province: address.province,
      city: address.city,
      postalCode: address.postalCode || undefined,
      street: address.street,
      streetNumber: address.streetNumber || undefined,
      additionalInfo: address.additionalInfo || undefined,
      label: address.label || "Casa",
    });
  };

  const handleEditAddress = (address: AddressResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const renderAddressCard = (address: AddressResponse, isSelected: boolean) => (
    <motion.div
      key={address.id}
      layoutId={`address-${address.id}`}
      className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'border-red-500 bg-red-50 shadow-md'
          : 'border-gray-200 hover:border-red-300 hover:shadow-sm bg-white'
      }`}
      onClick={() => handleAddressCardSelect(address)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Check badge superior */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10"
        >
          <FiCheck className="w-4 h-4 text-white font-bold" />
        </motion.div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icono */}
        <div className={`p-2.5 rounded-lg flex-shrink-0 ${
          isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          <FiHome className="w-5 h-5" />
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold mb-1 ${
            isSelected ? 'text-red-900' : 'text-gray-900'
          }`}>
            {address.fullName}
          </h4>
          {address.label && (
            <p className="text-xs text-red-600 font-semibold mb-1">{address.label}</p>
          )}
          <p className="text-sm text-gray-600 mb-1">
            {address.street} {address.streetNumber}
          </p>
          <p className="text-sm text-gray-500">
            {address.city}, {address.province}
          </p>
          {address.postalCode && (
            <p className="text-xs text-gray-400 mt-1">
              CP: {address.postalCode}
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => handleEditAddress(address, e)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar dirección"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAddressToDelete(address);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar dirección"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Indicador visual de selección */}
      {isSelected && (
        <motion.div
          layoutId="selected-indicator"
          className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-b-xl"
          initial={false}
        />
      )}
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiMapPin className="w-5 h-5 mr-2 text-red-600" />
          Dirección de Envío
        </h3>
      </div>

      {/* Tabs de navegación */}
      {savedAddresses.length > 0 && (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setShowSavedAddresses(true)}
            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              showSavedAddresses
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <FiHome className="w-4 h-4" />
              Mis direcciones ({savedAddresses.length})
            </span>
          </button>
          <button
            onClick={() => setShowSavedAddresses(false)}
            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              !showSavedAddresses
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <FiPlus className="w-4 h-4" />
              Nueva dirección
            </span>
          </button>
        </div>
      )}

      {currentUser && selectedAddress?.fullName && !showSavedAddresses && savedAddresses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-center space-x-2">
            <FiHome className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Algunos datos se cargaron desde tu perfil. Puedes modificarlos si es necesario.
            </span>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {showSavedAddresses && savedAddresses.length > 0 ? (
          <motion.div
            key="saved-addresses"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {isLoadingAddresses ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">
                    Selecciona una dirección guardada:
                  </p>
                  <span className="text-xs text-gray-500">
                    {savedAddresses.length} {savedAddresses.length === 1 ? 'dirección' : 'direcciones'}
                  </span>
                </div>
                {savedAddresses.map((address) => {
                  const isSelected = selectedAddress && 
                                   'id' in selectedAddress && 
                                   typeof selectedAddress.id === 'number' &&
                                   selectedAddress.id === address.id;
                  
                  return renderAddressCard(address, Boolean(isSelected));
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="main-address-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {savedAddresses.length === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No tienes direcciones guardadas. Completa el formulario para crear una nueva.
                </p>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <AddressForm
                address={selectedAddress}
                onAddressChange={onAddressChange}
                onSave={showSaveOption ? handleSaveAddress : undefined}
                editingAddress={null}
                isEditing={false}
                currentUser={currentUser}
                showSaveButton={showSaveOption}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddressForm && (
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
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <AddressForm
                address={editingAddress || null}
                onAddressChange={(field, value) => {
                  if (editingAddress) {
                    const updated = {
                      ...editingAddress,
                      [field]: value
                    };
                    setEditingAddress(updated);
                  }
                }}
                onSave={(address) => handleSaveAddress(address)}
                editingAddress={editingAddress}
                isEditing={!!editingAddress}
                isModal={true}
                currentUser={currentUser}
                showSaveButton={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                Esta acción eliminará la dirección <strong>{addressToDelete.label || addressToDelete.fullName}</strong> de forma definitiva.
                No se puede revertir.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAddressToDelete(null)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteAddress(addressToDelete.id)}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
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
  address: Address | null;
  onAddressChange: (field: keyof Address, value: string) => void;
  onSave?: (address: Address) => void;
  editingAddress?: AddressResponse | null;
  isEditing?: boolean;
  isModal?: boolean;
  currentUser?: User | null;
  showSaveButton?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onAddressChange,
  onSave,
  editingAddress,
  isEditing = false,
  isModal = false,
  currentUser,
  showSaveButton = false
}) => {
  const [localAddress, setLocalAddress] = useState<Address>(() => {
    if (editingAddress) {
      return {
        id: editingAddress.id,
        fullName: editingAddress.fullName,
        country: editingAddress.country,
        province: editingAddress.province,
        city: editingAddress.city,
        postalCode: editingAddress.postalCode || undefined,
        street: editingAddress.street,
        streetNumber: editingAddress.streetNumber || undefined,
        additionalInfo: editingAddress.additionalInfo || undefined,
        label: editingAddress.label || "Casa",
      };
    }
    if (address) return address;
    
    if (currentUser) {
      return {
        fullName: currentUser.name || currentUser.clientDetails?.legalCompanyName || "",
        country: "Argentina",
        province: "",
        city: "",
        postalCode: undefined,
        street: "",
        streetNumber: undefined,
        additionalInfo: undefined,
        label: "Casa"
      };
    }
    
    return {
      fullName: "",
      country: "",
      province: "",
      city: "",
      postalCode: undefined,
      street: "",
      streetNumber: undefined,
      additionalInfo: undefined,
      label: "Casa"
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const validateField = (field: keyof Address, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'El nombre completo es requerido';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El nombre solo puede contener letras';
        break;
      
      case 'country':
        if (!value.trim()) return 'El país es requerido';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El país solo puede contener letras';
        break;
      
      case 'province':
        if (!value.trim()) return 'La provincia es requerida';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'La provincia solo puede contener letras';
        break;
      
      case 'city':
        if (!value.trim()) return 'La ciudad es requerida';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'La ciudad solo puede contener letras';
        break;
      
      case 'postalCode':
        if (value && !/^\d{4,8}$/.test(value)) return 'Código postal inválido (4-8 dígitos)';
        break;
      
      case 'street':
        if (!value.trim()) return 'La calle es requerida';
        if (value.trim().length < 3) return 'La calle debe tener al menos 3 caracteres';
        break;
      
      case 'streetNumber':
        if (!value.trim()) return 'El número es requerido';
        if (!/^[0-9a-zA-Z\s\-\/]+$/.test(value)) return 'Número inválido';
        break;
    }
    return undefined;
  };

  const handleInputChange = (field: keyof Address, value: string) => {
    setLocalAddress(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    if (!isModal) {
      onAddressChange(field, value);
    }
  };

  const handleSave = () => {
    const newErrors: Partial<Record<keyof Address, string>> = {};
    let hasErrors = false;

    (['fullName', 'country', 'province', 'city', 'street', 'streetNumber'] as const).forEach(field => {
      const error = validateField(field, localAddress[field] || '');
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    if (localAddress.postalCode) {
      const postalError = validateField('postalCode', localAddress.postalCode);
      if (postalError) {
        newErrors.postalCode = postalError;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    if (onSave) {
      onSave(localAddress);
    }
  };

  const isFormValid = () => {
    return localAddress.fullName && 
           localAddress.street && 
           localAddress.streetNumber && 
           localAddress.city && 
           localAddress.province;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Etiqueta (Casa, Trabajo, etc.)"
            value={localAddress.label || ''}
            onChange={(e) => handleInputChange('label', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-600 border-gray-200"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Nombre completo *"
            value={localAddress.fullName || ''}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-600 ${
              errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'
            }`}
            required
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="País *"
              value={localAddress.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-600 ${
                errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
              required
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Provincia *"
              value={localAddress.province || ''}
              onChange={(e) => handleInputChange('province', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-600 ${
                errors.province ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
              required
            />
            {errors.province && (
              <p className="text-red-500 text-xs mt-1">{errors.province}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="Ciudad *"
              value={localAddress.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-600 ${
                errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
              required
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Código Postal"
              value={localAddress.postalCode || ''}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-600 ${
                errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="Calle *"
              value={localAddress.street || ''}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-600 ${
                errors.street ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
              required
            />
            {errors.street && (
              <p className="text-red-500 text-xs mt-1">{errors.street}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Número *"
              value={localAddress.streetNumber || ''}
              onChange={(e) => handleInputChange('streetNumber', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-600 ${
                errors.streetNumber ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
              required
            />
            {errors.streetNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.streetNumber}</p>
            )}
          </div>
        </div>

        <textarea
          placeholder="Información adicional (opcional)"
          value={localAddress.additionalInfo || ''}
          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
          rows={3}
        />
      </div>

      <p className="text-xs text-gray-500">
        * Campos requeridos
      </p>

      {showSaveButton && onSave && (
        <motion.button
          onClick={handleSave}
          disabled={!isFormValid()}
          whileHover={isFormValid() ? { scale: 1.02 } : {}}
          whileTap={isFormValid() ? { scale: 0.98 } : {}}
          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isFormValid()
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FiCheck className="w-5 h-5" />
          {isEditing ? 'Actualizar Dirección' : 'Guardar Dirección'}
        </motion.button>
      )}
    </div>
  );
};

export default AddressSelector;
