"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

const googleIcon = "/assets/Icons/Socials/google.svg";

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast("Por favor ingresa tu email y contraseña");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        toast.error("Email o contraseña incorrectos");
        return;
      }

      toast.success("¡Bienvenido!");
      const session = await getSession();
      if (session?.user?.role === "ADMIN") {
        router.replace("/admin/clientes");
      } else {
        router.replace(callbackUrl);
      }
      router.refresh();
      onLoginSuccess?.();
    } catch {
      toast.error("Error al iniciar sesión. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Error al iniciar sesión con Google.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-7 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B0000]/80">
          Acceso
        </p>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          Iniciar sesión
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Ingresa con tu cuenta mayorista para continuar.
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-gray-700 text-sm font-medium">
          Correo electrónico:
        </label>
        <input
          type="email"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          disabled={isSubmitting}
          placeholder="ejemplo@correo.com"
        />
      </div>

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
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            disabled={isSubmitting}
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
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Iniciando sesión...
          </span>
        ) : (
          "Iniciar Sesión"
        )}
      </button>

      <p className="text-sm text-gray-500 text-center">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-[#8B0000] font-semibold hover:underline">
          Solicitá acceso
        </Link>
      </p>

      <button
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        className="w-full p-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500 flex items-center justify-center gap-2 transition-all"
      >
        <img src={googleIcon} alt="Google" className="w-5 h-5" />
        {isSubmitting ? "Conectando..." : "Iniciar sesión con Google"}
      </button>
    </div>
  );
};

export default Login;
