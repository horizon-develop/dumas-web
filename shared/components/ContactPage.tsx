"use client";

import React, { useState } from "react";
import { FiMapPin, FiPhone, FiSend } from "react-icons/fi";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateWhatsAppURL = (data: FormData): string => {
    const phoneNumber = "5493794702786";
    const message = `Hola me llamo ${data.name}. Mi correo es ${data.email} y mi teléfono ${data.phone}.
Mi mensaje es: ${data.message}`;

    return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
    const whatsappURL = generateWhatsAppURL(formData);
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <header className="bg-[#8B0000] text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Contacto</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Formulario de contacto */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-[#8B0000] mb-6">Envíanos tu consulta</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/30 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent text-[#8B0000] placeholder:text-[#8B0000]/70"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/30 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent text-[#8B0000] placeholder:text-[#8B0000]/70"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/30 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent text-[#8B0000] placeholder:text-[#8B0000]/70"
                  placeholder="+54 379 4 983775"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Mensaje</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/30 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent text-[#8B0000] placeholder:text-[#8B0000]/70"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#8B0000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6A0000] transition-colors flex items-center justify-center gap-2"
              >
                <FiSend className="text-lg" />
                Enviar Mensaje
              </button>
            </form>
          </div>

          {/* Información de contacto */}
          <div className="flex flex-col gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-[#8B0000] mb-6">Información de contacto</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <FiMapPin className="text-[#8B0000] text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Dumas distribuciones</h3>
                    <p className="text-gray-600">C. PEREZ RUEDA 1765<br />Corrientes, Corrientes, Argentina. 3400</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <FiPhone className="text-[#8B0000] text-xl" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Teléfono</h3>
                    <a 
                      href="https://wa.me/5493794702786"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-[#8B0000] hover:underline transition-colors cursor-pointer"
                    >
                      +54 379 4 983775
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg flex flex-col flex-grow">
              <h2 className="text-2xl font-bold text-[#8B0000] mb-6">Nuestra ubicación</h2>
                <div className="rounded-lg overflow-hidden border-2 border-[#8B0000]/20 h-64 sm:h-72 md:h-full">
                <iframe
                  className="w-full h-full"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1342.327531099705!2d-58.764550228754906!3d-27.4897431376508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94456a43b8db35e5%3A0x3ffb0b9a7c3633f6!2sC.%20107%201765%2C%20W3400%20Corrientes!5e1!3m2!1ses-419!2sar!4v1758766840958!5m2!1ses-419!2sar"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
