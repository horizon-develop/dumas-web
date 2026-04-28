"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ProfileAttention: React.FC = () => {
  return (
    <section className="relative bg-white py-14 sm:py-20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-white z-20" />

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
        <motion.div
          className="md:w-3/5 text-center md:text-left"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg leading-tight">
            Beneficios Exclusivos para Profesionales
          </h2>
          <p className="text-base sm:text-lg text-gray-100 mb-6 sm:mb-8 drop-shadow-md max-w-2xl mx-auto md:mx-0">
            Registrate y accedé a precios mayoristas, seguimiento de pedidos prioritario y descuentos especiales en productos seleccionados.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#8B0000] text-white px-8 py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-[#6A0000] transition-colors shadow-lg w-full sm:w-auto"
          >
            Acceder ahora
          </Link>
        </motion.div>

        <div className="md:w-2/5 w-full h-56 sm:h-64 md:h-72 lg:h-80" aria-hidden="true" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white z-20" />
    </section>
  );
};

export default ProfileAttention;
