import { FaMapMarkerAlt, FaHeart, FaTruck } from 'react-icons/fa';
import Link from 'next/link';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Encabezado */}
      <div className="bg-red-600 text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Sobre Nosotros</h1>
        <p className="text-xl">Pasión por el cuidado animal desde 2018</p>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Sección Texto */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            <span className="border-b-4 border-red-600 pb-2">Nuestra Esencia</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Distribuidores especializados en productos veterinarios de alta calidad,
            comprometidos con el bienestar de tus mascotas.
          </p>
        </div>

        {/* Mapa Mejorado */}
        <div className="mb-12 rounded-xl overflow-hidden shadow-lg border-2 border-red-100 hover:shadow-xl transition-shadow duration-300">
          <div className="aspect-video w-full">
            <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1342.327531099705!2d-58.764550228754906!3d-27.4897431376508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94456a43b8db35e5%3A0x3ffb0b9a7c3633f6!2sC.%20107%201765%2C%20W3400%20Corrientes!5e1!3m2!1ses-419!2sar!4v1758766840958!5m2!1ses-419!2sar"
            style={{border:0}} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
          <div className="bg-red-600 p-4 flex items-center justify-center"> 
            <div className="flex items-center max-w-md">
              <FaMapMarkerAlt className="text-white mr-2 text-xl" />
              <p className="text-white font-medium">C. PEREZ RUEDA 1765, Corrientes, Corrientes, Argentina</p>
            </div>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-red-600 hover:transform hover:scale-105 transition-transform">
            <FaHeart className="text-red-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Compromiso</h3>
            <p className="text-gray-600">Productos seleccionados con máximo cuidado</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-red-600 hover:transform hover:scale-105 transition-transform">
            <FaTruck className="text-red-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Distribución</h3>
            <p className="text-gray-600">Entregas rápidas en todo el país</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-red-600 hover:transform hover:scale-105 transition-transform">
            <FaMapMarkerAlt className="text-red-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Ubicación</h3>
            <p className="text-gray-600">Punto estratégico para mejor cobertura</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-red-50 text-center py-12">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">¿Consultas?</h3>
        <Link
          href="/contacto"
          className="inline-block bg-[#8B0000] text-white px-8 py-3 rounded-lg hover:bg-[#6A0000] transition-all shadow-md hover:shadow-lg"
        >
          Contacto Directo
        </Link>
      </div>
    </div>
  );
};

export default AboutUs;