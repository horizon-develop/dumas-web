import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { storeUserData } from '../utils/authUtils';
import { registerUser } from '../api/authApi';
import type { Profile } from '../../user/types/profile';
import type { RegisterClientRequest } from '../types/authDto';

// ==================== INTERFACES Y TIPOS ====================
interface RegisterProps {
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  taxId: string;
  legalCompanyName: string;
  phoneNumber: string;
  profile: Profile;
}

// ==================== CONSTANTES ====================
const VALIDATION_REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  taxId: /^\d{11}$/,
  phoneNumber: /^\d{6,15}$/,
};

const INITIAL_FORM_DATA: FormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  taxId: "",
  legalCompanyName: "",
  phoneNumber: "",
  profile: "PETSHOP",
};

// ==================== COMPONENTE PRINCIPAL ====================
const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  // ==================== ESTADO ====================
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFieldsError, setShowFieldsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // ==================== FUNCIONES AUXILIARES ====================
  const getErrorIcon = () => (
    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );


  // ==================== VALIDACIONES ====================
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        return value.trim() ? "" : "El nombre es obligatorio";
      case "email":
        return VALIDATION_REGEX.email.test(value) ? "" : "Correo electrónico inválido";
      case "password":
        return value.length >= 6 ? "" : "La contraseña debe tener al menos 6 caracteres";
      case "confirmPassword":
        return value === formData.password ? "" : "Las contraseñas no coinciden";
      case "taxId":
        return VALIDATION_REGEX.taxId.test(value) ? "" : "CUIT inválido (11 dígitos)";
      case "legalCompanyName":
        return value.trim() ? "" : "La razón social es obligatoria";
      case "phoneNumber":
        return VALIDATION_REGEX.phoneNumber.test(value) ? "" : "Teléfono inválido (6 a 15 dígitos)";
      default:
        return "";
    }
  };

  const isFormValid = (): boolean =>
    Object.values(errors).every((err) => err === "") &&
    Object.values(formData).every((val) => val.trim() !== "");

  // ==================== MANEJO DE ERRORES ====================
  const handleError = (error: any) => {
    const errorMsg = error.message || "Error desconocido";
    setSubmitError(errorMsg);

    const shouldShowToast = errorMsg.includes("Servidor no disponible") || 
                           errorMsg.includes("Demasiadas solicitudes") ||
                           errorMsg.includes("Error de conexión");

    if (shouldShowToast) {
      toast.error(
        <div className="flex items-center">
          {getErrorIcon()}
          <span>{errorMsg}</span>
        </div>,
        { 
          position: "top-right", 
          duration: 6000,
        }
      );
    }
  };

  // ==================== MANEJO DE ÉXITO ====================
  const handleAuthSuccess = (userData: any) => {
    storeUserData(userData);

    window.dispatchEvent(new CustomEvent('auth-login', { 
      detail: userData 
    }));

    if (!onSuccess) {
      toast.success(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>¡Registro exitoso! Bienvenido</span>
        </div>,
        {
          position: "top-right",
          duration: 3000,
        }
      );
    }
    
    if (userData.role === 'ADMINISTRADOR') {
      navigate('/admin/dashboard');
    } else {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/shop');
      }
    }
  };

  // ==================== HANDLERS ====================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    const newErrors = {
      ...errors,
      [name]: validateField(name, value),
    };

    
    if (name === "password") {
      newErrors.confirmPassword = validateField("confirmPassword", formData.confirmPassword);
    }

    setErrors(newErrors);
    setShowFieldsError(false);
    setSubmitError('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!isFormValid()) {
      setShowFieldsError(true);
      toast(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Por favor completa todos los campos correctamente</span>
        </div>,
        { position: "top-right", duration: 4000 }
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const request: RegisterClientRequest = {
        email: formData.email.trim(),
        password: formData.password,
        taxId: formData.taxId,
        legalCompanyName: formData.legalCompanyName.trim(),
        phoneNumber: formData.phoneNumber,
        profile: formData.profile,
      };

      const response = await registerUser(request);

      handleAuthSuccess(response);
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B0000]/80">Registro</p>
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">Crea tu cuenta!</h3>
          <p className="text-sm text-gray-600 mt-1">
            Accede a precios de distribuidor y arma tu petshop en minutos.
          </p>
        </div>
      </div>

      {/* Error de envío */}
      {submitError && (
        <div className="mb-2 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          <div className="flex items-center">
            {getErrorIcon()}
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {/* Nombre */}
      <div className="space-y-1">
        <label className="block text-gray-700 text-sm font-medium">
          Nombre:
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all ${
            errors.name 
              ? "border-red-500 focus:ring-red-500" 
              : "border-gray-300 focus:ring-red-500 focus:border-red-500"
          }`}
          placeholder="Tu nombre completo"
          required
          disabled={isSubmitting}
          autoComplete="name"
        />
        {errors.name && (
          <span className="text-xs text-red-600 block">{errors.name}</span>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="block text-gray-700 text-sm font-medium">
          Correo electrónico:
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all ${
            errors.email 
              ? "border-red-500 focus:ring-red-500" 
              : "border-gray-300 focus:ring-red-500 focus:border-red-500"
          }`}
          placeholder="ejemplo@correo.com"
          required
          disabled={isSubmitting}
          autoComplete="email"
        />
        {errors.email && (
          <span className="text-xs text-red-600 block">{errors.email}</span>
        )}
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-gray-700 text-sm font-medium">
            Contraseña:
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 transition-all ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-red-500 focus:border-red-500"
              }`}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-red-600 block">{errors.password}</span>
          )}
        </div>
        
        <div className="space-y-1">
          <label className="block text-gray-700 text-sm font-medium">
            Confirmar:
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 transition-all ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-red-500 focus:border-red-500"
              }`}
              placeholder="Repetir contraseña"
              required
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-600 block">{errors.confirmPassword}</span>
          )}
        </div>
      </div>

      {/* Tipo de perfil */}
      <div className="space-y-1">
        <label className="block text-gray-700 text-sm font-medium">
          Tipo de perfil:
        </label>
        <select
          name="profile"
          value={formData.profile}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none bg-white"
          required
          disabled={isSubmitting}
        >
          <option value="PETSHOP">PETSHOP</option>
          <option value="VETERINARIA">VETERINARIA</option>
          <option value="FORRAJERIA">FORRAJERIA</option>
        </select>
      </div>

      {/* CUIT */}
      <div className="space-y-1">
        <label className="block text-gray-700 text-sm font-medium">
          CUIT:
        </label>
        <input
          type="text"
          name="taxId"
          value={formData.taxId}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all ${
            errors.taxId 
              ? "border-red-500 focus:ring-red-500" 
              : "border-gray-300 focus:ring-red-500 focus:border-red-500"
          }`}
          placeholder="11 dígitos sin guiones"
          required
          disabled={isSubmitting}
          autoComplete="off"
        />
        {errors.taxId && (
          <span className="text-xs text-red-600 block">{errors.taxId}</span>
        )}
      </div>

      {/* Razón social */}
      <div className="space-y-1">
        <label className="block text-gray-700 text-sm font-medium">
          Razón social:
        </label>
        <input
          type="text"
          name="legalCompanyName"
          value={formData.legalCompanyName}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all ${
            errors.legalCompanyName 
              ? "border-red-500 focus:ring-red-500" 
              : "border-gray-300 focus:ring-red-500 focus:border-red-500"
          }`}
          placeholder="Nombre legal de la empresa"
          required
          disabled={isSubmitting}
          autoComplete="organization"
        />
        {errors.legalCompanyName && (
          <span className="text-xs text-red-600 block">{errors.legalCompanyName}</span>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-1">
        <label className="block text-gray-700 text-sm font-medium">
          Teléfono:
        </label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all ${
            errors.phoneNumber 
              ? "border-red-500 focus:ring-red-500" 
              : "border-gray-300 focus:ring-red-500 focus:border-red-500"
          }`}
          placeholder="Número sin espacios ni guiones"
          required
          disabled={isSubmitting}
          autoComplete="tel"
        />
        {errors.phoneNumber && (
          <span className="text-xs text-red-600 block">{errors.phoneNumber}</span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !isFormValid()}
        className={`w-full py-3 font-semibold rounded-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all ${
          isFormValid() && !isSubmitting
            ? 'bg-[#8B0000] text-white hover:bg-[#6A0000]' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Registrando...
          </div>
        ) : (
          'Registrarse'
        )}
      </button>

      {/* Error de campos vacíos */}
      {showFieldsError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Es necesario completar todos los campos correctamente</span>
          </div>
        </div>
      )}
      <div className="text-sm text-gray-600 text-center">
        ¿Ya tenes cuenta?{" "}
        <button
          type="button"
          className="text-[#8B0000] font-semibold hover:underline"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('auth-open-login'));
          }}
        >
          Iniciar sesión
        </button>
      </div>
    </form>
  );
};

export default Register;
