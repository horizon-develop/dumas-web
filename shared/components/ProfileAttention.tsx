"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const BENEFITS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    title: "Precios de distribuidor",
    description: "Accedé a precios mayoristas exclusivos para revendedores habilitados.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Catálogo completo",
    description: "Alimentos, fármacos, accesorios y saneamiento de las marcas más reconocidas.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Atención personalizada",
    description: "Un equipo dedicado que conoce el negocio y acompaña cada pedido.",
  },
];

const ProfileAttention: React.FC = () => {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold text-[#8B0000] uppercase tracking-widest mb-3">
              Para profesionales
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-5">
              Todo lo que tu negocio necesita, en un solo lugar
            </h2>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Registrate y accedé a precios mayoristas, seguimiento de pedidos y atención dedicada para tu petshop, veterinaria o forrajería.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[#8B0000] text-white px-7 py-3 rounded-lg text-sm font-semibold hover:bg-[#6A0000] transition-colors shadow-sm"
              >
                Crear cuenta
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-7 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 hover:bg-[#8B0000]/5 transition-colors duration-200"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ProfileAttention;
