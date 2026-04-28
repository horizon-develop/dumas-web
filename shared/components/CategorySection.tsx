"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORIES = [
  { name: "ALIMENTOS", image: "/assets/Categories/alimentos.webp", alt: "Categoría de alimentos" },
  { name: "FÁRMACOS", image: "/assets/Categories/farmacos.webp", alt: "Categoría de fármacos" },
  { name: "ACCESORIOS", image: "/assets/Categories/accesorios.webp", alt: "Categoría de accesorios" },
  { name: "SANEAMIENTO", image: "/assets/Categories/saneamiento.webp", alt: "Categoría de saneamiento" },
];

const CategorySection: React.FC = () => {
  return (
    <section className="py-10 bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 md:-mt-24">
          {CATEGORIES.map((category, i) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href="/shop"
                className="group relative h-44 sm:h-52 lg:h-72 w-full overflow-hidden shadow-lg rounded-xl lg:hover:scale-[1.02] active:scale-95 transition-transform duration-300 block"
                style={{ border: "4px solid #FF0000", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.15)" }}
              >
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.alt}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 text-center py-3 bg-gradient-to-t from-black/70 to-transparent">
                  <span className="text-xl font-bold text-white drop-shadow-md">{category.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-[#8B0000] mb-3 px-2 md:text-4xl">
            Especialistas en Suministros Profesionales
          </h2>
          <p className="text-gray-600 text-base md:text-xl max-w-xl mx-auto px-2">
            Productos de alta calidad para el cuidado animal especializado
          </p>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
