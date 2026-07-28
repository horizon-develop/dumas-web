import { Suspense } from "react";
import type { Metadata } from "next";
import Login from "@/features/auth/components/Login";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accedé a tu cuenta mayorista de Dumas Distribuciones para ver precios y hacer pedidos.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff5f5] via-white to-[#fff0f0] flex items-center justify-center p-4">
      <Suspense>
        <Login />
      </Suspense>
    </main>
  );
}
