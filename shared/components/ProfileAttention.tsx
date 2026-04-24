import React, { useEffect, useState } from "react";

const ProfileAttention: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="relative bg-white py-14 sm:py-20 overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 1s ease-in-out"
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-white z-20"></div>

      <div className="absolute inset-0 z-0">
        <img
          src="/assets/Profile/professional-benefits.webp"
          alt="Beneficios profesionales"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/25" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-3/5 text-center md:text-left animate__animated animate__fadeInLeft">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg leading-tight">
            Beneficios Exclusivos para Profesionales
          </h1>
          <p className="text-base sm:text-lg text-gray-100 mb-6 sm:mb-8 drop-shadow-md max-w-2xl mx-auto md:mx-0">
            Regístrate y accede a precios mayoristas, seguimiento de pedidos prioritario y descuentos especiales en productos seleccionados.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('auth-open-register'))}
            className="inline-block bg-[#8B0000] text-white px-8 py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-[#6A0000] transition-colors shadow-lg w-full sm:w-auto"
          >
            Registrarse ahora
          </button>
        </div>

        <div className="md:w-2/5 w-full h-56 sm:h-64 md:h-72 lg:h-80 animate__animated animate__fadeInRight" aria-hidden="true" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white z-20"></div>
    </section>
  );
};

export default ProfileAttention;
