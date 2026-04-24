import { Link } from "react-router-dom";
import RotatingText from "./Animations/RotatingText";

const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/Hero/hero-desktop.webp"
          alt="Productos para mascotas y veterinaria"
          className="w-full h-full object-cover object-center md:object-right"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-28">
        <div className="max-w-3xl flex flex-col gap-6 text-center md:text-left items-center md:items-start">
          <div className="space-y-4 animate__animated animate__fadeInLeft" style={{ animationDuration: "1s" }}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg leading-tight">
              Lanza tu <span className="text-[#FFE4E6]">petshop</span> sin complicaciones
            </h1>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-100 inline-flex flex-wrap justify-center md:justify-start items-center gap-3">
              <span className="px-3 py-1 bg-[#8B0000]/80 text-white rounded-lg">Stock listo</span>
              <RotatingText
                texts={["Mayorista", "Envíos rápidos", "Marcas líderes"]}
                mainClassName="px-2 bg-white/20 text-white py-1 rounded-lg w-max"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.03}
                splitLevelClassName="overflow-hidden"
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 400,
                  bounce: 0.1
                }}
                rotationInterval={2600}
                splitBy="words"
              />
            </div>

            <p className="text-base sm:text-lg lg:text-xl text-gray-100 max-w-2xl leading-relaxed mx-auto md:mx-0">
              Abastece tu tienda con productos veterinarios y pet care de forma ágil, con precios de distribuidor y soporte dedicado para nuevos negocios.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start animate__animated animate__fadeInUp">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("auth-open-register"))}
                className="inline-flex items-center justify-center bg-white text-[#8B0000] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105 w-full sm:w-auto"
                aria-label="Crear cuenta gratis"
              >
                Crear cuenta gratis
              </button>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center bg-[#8B0000]/80 text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#8B0000] transition-all duration-300 shadow-lg border border-white/20 w-full sm:w-auto"
                aria-label="Ver catálogo mayorista"
              >
                Ver catálogo mayorista
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
