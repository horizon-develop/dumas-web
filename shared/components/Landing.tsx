import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import CategorySection from "./CategorySection";
import ProfileAttention from "./ProfileAttention";
import ProductsList from "../../features/product/components/ProductList";
import BrandBanner from "./Banners/BrandBanner";
import SlidableBanner from "./Banners/SlidableBanner";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { isAuthenticated as checkAuth } from "../../features/auth/utils/authUtils";

const PromoModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = typeof window !== "undefined" ? localStorage.getItem("promo-modal-seen") : "true";
    if (!seen) {
      setOpen(true);
      localStorage.setItem("promo-modal-seen", "true");
    }
  }, []);

  if (!open) return null;

  const handleRegister = () => {
    setOpen(false);
    navigate("/shop");
    window.dispatchEvent(new Event("auth-open-register"));
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-[9999] w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate__animated animate__fadeInUp">
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#8B0000]/80 uppercase tracking-[0.12em]">Bienvenido</p>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">Arranca tu petshop con un impulso</h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600">
            Regístrate hoy y activa <span className="font-semibold text-[#8B0000]">15% OFF en tu primer compra mayorista</span> + asesoría para armar tu catálogo inicial.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRegister}
              className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-[#8B0000] to-[#6A0000] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Crear cuenta y usar promo
            </button>
            <a
              href="/shop"
              className="inline-flex items-center justify-center px-5 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200"
              onClick={() => setOpen(false)}
            >
              Ver catálogo
            </a>
          </div>
          <div className="text-xs text-gray-500">
            Promo válida en pedidos superiores a $50.000 durante los próximos 7 días.
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const isUserAuthenticated = useMemo(() => checkAuth(), []);

  return (
    <div>
      <PromoModal />
      <HeroSection />
      <CategorySection />
      <SlidableBanner />
      <ProfileAttention />
      <BrandBanner />
      <section className="bg-gradient-to-br from-white via-red-50 to-gray-100 pt-6 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-[0.14em]">Un adelanto del catálogo</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                ¿Qué esperas? Mira el catálogo completo
              </h2>
              <p className="text-gray-700 max-w-2xl text-sm sm:text-base">
                Te mostramos solo una muestra. Accede para ver todos los productos, precios mayoristas y ofertas exclusivas pensadas para tu petshop.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/shop"
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 transition-colors"
              >
                Ver catálogo completo
              </Link>
              {!isUserAuthenticated && (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("auth-open-register"))}
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-700 font-semibold bg-white shadow-sm hover:border-red-400 hover:text-red-800 transition-colors"
                >
                  Iniciá sesión o regístrate
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <ProductsList plainBackground />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
