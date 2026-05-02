"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORIES = [
  { name: "Alimentos", image: "/assets/Categories/alimentos.webp", alt: "Categoría de alimentos" },
  { name: "Fármacos", image: "/assets/Categories/farmacos.webp", alt: "Categoría de fármacos" },
  { name: "Accesorios", image: "/assets/Categories/accesorios.webp", alt: "Categoría de accesorios" },
  { name: "Saneamiento", image: "/assets/Categories/saneamiento.webp", alt: "Categoría de saneamiento" },
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
                className="group relative h-44 sm:h-52 lg:h-72 w-full overflow-hidden shadow-md hover:shadow-xl rounded-xl transition-shadow duration-300 block"
              >
                <img
                  src={category.image}
                  alt={category.alt}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/75" />
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
                  <span className="text-base font-semibold text-white tracking-wide">{category.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 px-2 md:text-3xl">
            Especialistas en suministros para el cuidado animal
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto px-2">
            Abastecemos petshops, veterinarias y forrajerías de toda la región con productos de marcas líderes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
