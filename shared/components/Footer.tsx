import React from "react";
import { FiSend, FiCreditCard, FiGlobe } from "react-icons/fi";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#8B0000] text-white border-t-4 border-[#6A0000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Columna 1: Suscripción */}
          <div>
            <div className="text-xl font-bold mb-4">Te mantenemos actualizado</div>
            <p className="mb-4 text-gray-200">Sé el primero en enterarte de las promos y descuentos</p>
            <form className="space-y-3">
              <input
                type="email"
                id="email"
                autoComplete="email"
                aria-label="Entrada de correo electrónico"
                placeholder="Ingresa tu correo electrónico"
                className="w-full px-4 py-2 rounded-lg bg-white text-[#8B0000] border border-[#8B0000]/30 focus:outline-none focus:ring-2 focus:ring-[#8B0000] placeholder:text-[#8B0000]/70"
              />
              <button
                aria-label="Botón para suscribirte a novedades"
                type="submit"
                className="w-full bg-white text-[#8B0000] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <FiSend className="text-lg" />
                Suscribirme
              </button>
            </form>
          </div>

          {/* Columna 2: Sobre Nosotros */}
          <div>
            <div className="text-xl font-bold mb-4">Información</div>
            <ul className="space-y-2">
              <li><a href="/contacto" className="hover:text-gray-200 transition-colors">Contacto</a></li>
              <li><a href="/nosotros" className="hover:text-gray-200 transition-colors">Quiénes somos</a></li>
            </ul>
          </div>

          {/* Columna 3: Métodos de pago */}
          <div>
            <div className="mb-8">
              <div className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiCreditCard className="text-2xl" />
                Métodos de Pago
              </div>
              <div className="flex flex-wrap gap-4">
                <img src="/assets/Icons/Payment-methods/efectivo.webp" alt="Efectivo" className="h-8 w-8 object-contain" title="Efectivo" />
                <img src="/assets/Icons/Payment-methods/mercado-pago.svg" alt="Mercado Pago" className="h-8 w-8 object-contain" title="Mercado pago" />
                <img src="/assets/Icons/Payment-methods/transferencia.webp" alt="Transferencia Bancaria" className="h-8 w-8 object-contain" title="Transferencia bancaria" />
              </div>
            </div>
            <div className="mb-8">
              <div className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiGlobe className="text-2xl"/>
                Redes Sociales
              </div>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.instagram.com/dumas.distribucion/" target="_blank" rel="noopener noreferrer"><img src="/assets/Icons/Socials/instagram.svg" alt="Instagram" className="h-6 w-8 object-contain" title="Instagram"/></a>
                <a href="https://wa.me/5493794702786" target="_blank" rel="noopener noreferrer"><img src="/assets/Icons/Socials/whatsapp.svg" alt="Whatsapp" className="h-6 w-8 object-contain" title="Whatsapp"/></a>
                <a href="https://www.facebook.com/distribuidora.dumas/" target="_blank" rel="noopener noreferrer"><img src="/assets/Icons/Socials/facebook.svg" alt="Facebook" className="h-6 w-8 object-contain" title="Facebook"/></a>
              </div>
            </div>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-sm text-white/80">
            Dumas distribuciones {new Date().getFullYear()} - Todos los derechos reservados
          </p>
          <p className="text-sm text-white/80">Desarrollado por <a href="https://www.instagram.com/horizondev_/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Horizon Dev</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
