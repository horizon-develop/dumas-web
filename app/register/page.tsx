import type { Metadata } from "next";
import Register from "@/features/auth/components/Register";

export const metadata: Metadata = {
  title: "Crear cuenta mayorista",
  description: "Registrá tu petshop, veterinaria o forrajería para operar como cliente mayorista de Dumas Distribuciones.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff5f5] via-white to-[#fff0f0] flex items-center justify-center p-4">
      <Register />
    </main>
  );
}
