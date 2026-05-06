"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

type Step = "cuit" | "form";

const eyeIcon = (visible: boolean) =>
  visible ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

export default function Register() {
  const [step, setStep] = useState<Step>("cuit");
  const [taxId, setTaxId] = useState("");
  const [taxIdError, setTaxIdError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "name": return value.trim() ? "" : "El nombre es obligatorio";
      case "email": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Email inválido";
      case "password": return value.length >= 6 ? "" : "Mínimo 6 caracteres";
      case "confirm": return value === form.password ? "" : "Las contraseñas no coinciden";
      default: return "";
    }
  };

  const handleCuitSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const digits = taxId.replace(/\D/g, "");
    if (digits.length !== 11) {
      setTaxIdError("CUIT inválido (11 dígitos)");
      return;
    }
    setTaxIdError("");
    setLookingUp(true);
    try {
      const res = await fetch(`/api/auth/lookup-cuit?cuit=${digits}`);
      const data = await res.json();
      setForm({ name: data.name ?? "", email: data.email ?? "", password: "", confirm: "" });
      setErrors({});
      setStep("form");
    } catch {
      toast.error("No se pudo verificar el CUIT. Intentá de nuevo.");
    } finally {
      setLookingUp(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({
      ...errs,
      [name]: validateField(name, value),
      ...(name === "password" ? { confirm: validateField("confirm", form.confirm) } : {}),
    }));
  };

  const isFormValid =
    Object.values(form).every((v) => v.trim()) &&
    Object.values(errors).every((e) => e === "");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    for (const key of Object.keys(form) as (keyof typeof form)[]) {
      newErrors[key] = validateField(key, form[key]);
    }
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, taxId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al registrarse");
        return;
      }
      setDone(true);
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">¡Solicitud recibida!</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Tu cuenta está pendiente de aprobación. Nuestro equipo la revisará y te notificará cuando esté activa.
        </p>
        <Link href="/login" className="inline-block text-sm text-[#8B0000] font-semibold hover:underline">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  if (step === "cuit") {
    return (
      <form onSubmit={handleCuitSubmit} className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8B0000]/80">Registro</p>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">Solicitá tu acceso</h2>
          <p className="text-sm text-gray-500 mt-1">Precios mayoristas para petshops y veterinarias.</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">CUIT</label>
          <input
            type="text"
            value={taxId}
            onChange={(e) => {
              setTaxId(e.target.value);
              setTaxIdError("");
            }}
            placeholder="20-12345678-9"
            autoComplete="off"
            autoFocus
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all text-sm ${
              taxIdError ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-red-200 focus:border-red-400"
            }`}
          />
          {taxIdError && <p className="text-xs text-red-600">{taxIdError}</p>}
          <p className="text-xs text-gray-400">Ingresá el CUIT de tu negocio para verificar tu cuenta.</p>
        </div>

        <button
          type="submit"
          disabled={lookingUp || !taxId.trim()}
          className="w-full py-3 text-sm font-semibold rounded-lg transition-all bg-[#8B0000] text-white hover:bg-[#6A0000] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {lookingUp ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Buscando...
            </span>
          ) : "Continuar"}
        </button>

        <p className="text-sm text-gray-500 text-center">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-[#8B0000] font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    );
  }

  const formField = (
    id: keyof typeof form,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={id === "password" || id === "confirm" ? (showPass ? "text" : "password") : type}
          name={id}
          value={form[id]}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={submitting}
          autoComplete={id === "password" || id === "confirm" ? "new-password" : id === "email" ? "email" : "off"}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all text-sm ${
            errors[id] ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-red-200 focus:border-red-400"
          } ${id === "password" || id === "confirm" ? "pr-10" : ""}`}
        />
        {(id === "password" || id === "confirm") && (
          <button type="button" onClick={() => setShowPass((v) => !v)} tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {eyeIcon(showPass)}
          </button>
        )}
      </div>
      {errors[id] && <p className="text-xs text-red-600">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8B0000]/80">Registro</p>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">Completá tus datos</h2>
      </div>

      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">CUIT</p>
          <p className="text-sm font-mono text-gray-800">{taxId}</p>
        </div>
        <button
          type="button"
          onClick={() => setStep("cuit")}
          className="text-xs text-[#8B0000] font-semibold hover:underline"
        >
          Cambiar
        </button>
      </div>

      {formField("name", "Nombre / Razón social", "text", "Tu nombre o razón social")}
      {formField("email", "Correo electrónico", "email", "ejemplo@correo.com")}

      <div className="grid grid-cols-2 gap-3">
        {formField("password", "Contraseña")}
        {formField("confirm", "Confirmar")}
      </div>

      <button
        type="submit"
        disabled={submitting || !isFormValid}
        className="w-full py-3 text-sm font-semibold rounded-lg transition-all bg-[#8B0000] text-white hover:bg-[#6A0000] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Registrando...
          </span>
        ) : "Solicitar acceso"}
      </button>

      <p className="text-sm text-gray-500 text-center">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-[#8B0000] font-semibold hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
