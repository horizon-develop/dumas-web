import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { storeUserData, clearUserData } from '../utils/authUtils';
import { signInWithGoogle, loginUser, loginWithGoogle } from '../api/authApi';
import CompleteProfileModal from '../../user/components/CompleteProfileModal';
const googleIcon = '/assets/Icons/Socials/google.svg';

// ==================== INTERFACES ====================
interface LoginProps {
  onLoginSuccess?: () => void;
}

type ToastType = "error" | "warning" | "info";

// ==================== COMPONENTE PRINCIPAL ====================
const Login = ({ onLoginSuccess }: LoginProps) => {
  // ==================== ESTADO ====================
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ==================== FUNCIONES AUXILIARES ====================
  const getToastDuration = (errorType: string): number => {
    switch (errorType) {
      case 'auth': return 4000;
      case 'validation': return 5000;
      case 'permission': return 7000;
      case 'server':
      case 'connection': return 8000;
      case 'network':
      case 'timeout': return 6000;
      default: return 5000;
    }
  };

  const showToast = (type: ToastType, content: string, duration?: number) => {
    const baseOptions = {
      position: "top-right" as const,
      duration,
    };

    if (type === "error") {
      toast.error(content, baseOptions);
    } else if (type === "warning") {
      toast(content, baseOptions);
    } else {
      toast(content, baseOptions);
    }
  };

  // ==================== MANEJO DE ERRORES ====================
  const handleError = (error: any) => {
    let errorMsg = "Error desconocido";
    let errorType = "unknown";
    let toastType: ToastType = "error";
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.message;
      const errorCode = data?.errorCode;
      
      if (status !== undefined) {
        switch (status) {
          case 400:
            errorType = "validation";
            toastType = "warning";
            if (errorCode === "VALIDATION_ERROR" && data?.fieldErrors) {
              const fieldErrors = Object.entries(data.fieldErrors)
                .map(([field, error]) => `${field}: ${error}`)
                .join(", ");
              errorMsg = `Errores de validación: ${fieldErrors}`;
            } else {
              errorMsg = message || "Datos de entrada inválidos";
            }
            break;

          case 401:
            errorType = "auth";
            toastType = "error";
            errorMsg = errorCode === "INVALID_CREDENTIALS" 
              ? "Email o contraseña incorrectos"
              : message || "Credenciales incorrectas";
            break;

          case 403:
            errorType = "permission";
            toastType = "error";
            if (errorCode === "ACCOUNT_DISABLED") {
              errorMsg = "Tu cuenta está deshabilitada. Contacta al administrador";
            } else if (errorCode === "ACCOUNT_LOCKED") {
              errorMsg = "Tu cuenta está bloqueada temporalmente";
            } else {
              errorMsg = "Acceso denegado";
            }
            break;

          case 404:
            errorType = "notFound";
            toastType = "warning";
            errorMsg = errorCode === "USER_NOT_FOUND" 
              ? "Usuario no encontrado. Verifica tu email"
              : "Usuario no encontrado";
            break;

          case 429:
            errorType = "rateLimit";
            toastType = "warning";
            errorMsg = "Demasiadas solicitudes. Inténtalo en unos minutos";
            break;

          case 500:
          case 502:
          case 503:
          case 504:
            errorType = "server";
            toastType = "error";
            errorMsg = "Servidor no disponible. Inténtalo más tarde";
            break;

          default:
            errorType = status >= 500 ? "server" : "client";
            toastType = status >= 500 ? "error" : "warning";
            errorMsg = message || `Error de conexión (${status})`;
        }
      } else {
        errorMsg = message || "Error de conexión";
      }
    } else if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      errorType = "connection";
      toastType = "error";
      errorMsg = "No se puede conectar con el servidor";
    } else if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
      errorType = "timeout";
      toastType = "warning";
      errorMsg = "Tiempo de espera agotado. Inténtalo más tarde";
    } else {
      errorMsg = error.message || "Error de conexión desconocido";
    }

    showToast(toastType, errorMsg, getToastDuration(errorType));
  };

  // ==================== MANEJO DE AUTENTICACIÓN EXITOSA ====================
  const handleAuthSuccess = (userData: any) => {
    const needsProfileCompletion = userData.role === 'CLIENTE' && (
      !userData.clientDetails ||
      !userData.clientDetails.taxId ||
      !userData.clientDetails.legalCompanyName ||
      !userData.clientDetails.phoneNumber
    );

    if (needsProfileCompletion) {
      setCurrentUser(userData);
      setShowCompleteProfile(true);
      showToast("info", "Por favor completa tu perfil para continuar", 4000);
    } else {
      storeUserData(userData);
      window.dispatchEvent(new CustomEvent('auth-login', { detail: userData }));
      window.dispatchEvent(new CustomEvent("auth-change", { detail: userData }));

      toast.success("¡Bienvenido de vuelta!", { position: "top-right", duration: 2000 });

      if (userData.role === 'ADMINISTRADOR') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const redirectTo = sessionStorage.getItem("postLoginRedirect");
        if (redirectTo) {
          sessionStorage.removeItem("postLoginRedirect");
          navigate(redirectTo, { replace: true });
        } else if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    }
  };

  

  // ==================== HANDLERS ====================
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("warning", "Por favor ingresa tu email y contraseña", 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      clearUserData();

      const userData = await loginUser({
        email: email.trim(),
        password: password.trim()
      });

      handleAuthSuccess(userData);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      clearUserData();
      setIsSubmitting(true);

      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      const userData = await loginWithGoogle(idToken);

      handleAuthSuccess(userData);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileCompleted = (updatedUser: any) => {
    storeUserData(updatedUser);
    window.dispatchEvent(new CustomEvent('auth-login', { detail: updatedUser }));
    const redirectTo = sessionStorage.getItem("postLoginRedirect");
    if (redirectTo) {
      sessionStorage.removeItem("postLoginRedirect");
      navigate(redirectTo, { replace: true });
    } else if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  // ==================== RENDER ====================
  return (
    <>
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B0000]/80">Acceso</p>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Iniciar sesión</h2>
            <p className="text-sm text-gray-600 mt-1">
              Ingresa con tu cuenta mayorista para continuar.
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-gray-700 text-sm font-medium">
            Correo electrónico:
          </label>
          <input
            type="email"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
            placeholder="ejemplo@correo.com"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-gray-700 text-sm font-medium">
            Contraseña:
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              placeholder="Tu contraseña"
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
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className={`w-full py-3 text-white font-semibold rounded-lg focus:outline-none transition-all ${
            isSubmitting 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#8B0000] hover:bg-[#6A0000] focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Iniciando sesión...
            </div>
          ) : (
            "Iniciar Sesión"
          )}
        </button>

        <div className="flex items-center justify-center text-sm text-gray-600">
          <button
            type="button"
            className="text-[#8B0000] font-semibold hover:underline"
            onClick={() => window.dispatchEvent(new CustomEvent('auth-open-register'))}
          >
            Crear cuenta
          </button>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full p-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500 mt-2 flex items-center justify-center transition-all"
        >
          <img src={googleIcon} alt="Google" className="w-5 h-5 mr-2" />
          {isSubmitting ? "Conectando..." : "Iniciar sesión con Google"}
        </button>
      </div>

      <CompleteProfileModal
        isOpen={showCompleteProfile}
        onClose={() => setShowCompleteProfile(false)}
        userData={currentUser}
        onProfileCompleted={handleProfileCompleted}
      />
    </>
  );
};

export default Login;
