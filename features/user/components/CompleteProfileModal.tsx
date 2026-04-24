import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { completeProfile } from '../api/userApi';
import { storeUserData } from '../../auth/utils/authUtils';
import type { Profile } from '../types/profile';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onProfileCompleted: (updatedUser: any) => void;
}

const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  onProfileCompleted
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    taxId: '',
    legalCompanyName: '',
    phoneNumber: '',
    profile: 'PETSHOP' as Profile
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userData && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        taxId: userData.clientDetails?.taxId || '',
        legalCompanyName: userData.clientDetails?.legalCompanyName || userData.name || '',
        phoneNumber: userData.clientDetails?.phoneNumber || '',
        profile: userData.clientDetails?.profile || 'PETSHOP'
      }));
    }
  }, [userData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = 'CUIT/CUIL es requerido';
    } else if (!/^\d{11}$/.test(formData.taxId)) {
      newErrors.taxId = 'CUIT/CUIL debe tener 11 dígitos';
    }

    if (!formData.legalCompanyName.trim()) {
      newErrors.legalCompanyName = 'Nombre de la empresa es requerido';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Teléfono es requerido';
    } else if (!/^\d{6,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Teléfono debe tener entre 6 y 15 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getFieldStatus = (value: string, isFromGoogle: boolean) => {
    if (isFromGoogle && value) {
      return (
        <div className="flex items-center mt-1">
          <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600 text-xs">Obtenido de Google</span>
        </div>
      );
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Por favor completa todos los campos requeridos</span>
        </div>,
        { position: "top-right", duration: 4000 }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await completeProfile({
        name: formData.name,
        email: formData.email,
        taxId: formData.taxId,
        legalCompanyName: formData.legalCompanyName,
        phoneNumber: formData.phoneNumber,
        profile: formData.profile
      });
      
      storeUserData(updatedUser);
      
      toast.success(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>¡Perfil completado exitosamente! Bienvenido</span>
        </div>,
        {
          position: "top-right",
          duration: 3000,
        }
      );
      
      onProfileCompleted(updatedUser);
      
      onClose();
      
    } catch (error: any) {
      let errorMessage = "Error al completar el perfil";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = "Ya existe un perfil con estos datos";
      } else if (error.response?.status === 400) {
        errorMessage = "Datos inválidos. Verifica los campos";
      } else if (error.response?.status >= 500) {
        errorMessage = "Error del servidor. Inténtalo más tarde";
      }
      
      toast.error(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>,
        { position: "top-right", duration: 5000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast(
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Puedes completar tu perfil más tarde desde tu perfil</span>
      </div>,
      { position: "top-right", duration: 3000 }
    );
    
    storeUserData(userData);
    window.dispatchEvent(new CustomEvent('auth-login', { detail: userData }));
    
    onProfileCompleted(userData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Completa tu Perfil</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            <strong>¡Genial!</strong> Hemos pre-llenado algunos campos con tu información de Google. 
            Solo completa los datos faltantes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Tu nombre completo"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } ${formData.name && !errors.name ? 'bg-green-50 border-green-300' : ''}
              ${userData?.isGoogleLogin ? 'bg-gray-50' : ''}`}
              readOnly={userData?.isGoogleLogin}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
            {getFieldStatus(formData.name, userData?.isGoogleLogin)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } ${formData.email && !errors.email ? 'bg-green-50 border-green-300' : ''}`}
              readOnly={userData?.isGoogleLogin}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
            {userData?.isGoogleLogin && (
              <p className="text-green-600 text-xs mt-1">✓ Obtenido de Google</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CUIT/CUIL *
            </label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              placeholder="12345678901"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] ${
                errors.taxId ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={11}
            />
            {errors.taxId && (
              <p className="text-red-500 text-sm mt-1">{errors.taxId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              name="legalCompanyName"
              value={formData.legalCompanyName}
              onChange={handleInputChange}
              placeholder="Mi Empresa S.A."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] ${
                errors.legalCompanyName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.legalCompanyName && (
              <p className="text-red-500 text-sm mt-1">{errors.legalCompanyName}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Sugerencia: Puedes usar tu nombre si eres emprendedor individual
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="1234567890"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Negocio *
            </label>
            <select
              name="profile"
              value={formData.profile}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
            >
              <option value="PETSHOP">Pet Shop</option>
              <option value="VETERINARIA">Veterinaria</option>
              <option value="FORRAJERIA">Forrajería</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8B0000] text-white py-2 px-4 rounded-lg hover:bg-[#6A0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Completar Perfil'}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Completar más tarde
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
