import React from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";

const ErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-red-100 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden animate-fade-in">
        <div className="p-6 sm:p-10 flex flex-col gap-6">
          <div className="inline-flex items-center gap-3 px-3 py-2 bg-red-50 text-red-700 rounded-full border border-red-100 w-fit">
            <FiAlertTriangle className="h-5 w-5" />
            <span className="text-sm font-semibold">Algo salió mal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            No pudimos mostrar esta página
          </h1>
          <p className="text-gray-700 text-base sm:text-lg">
            Puede que la dirección sea incorrecta o el recurso ya no exista. Volve al catálogo o al inicio para seguir navegando.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 transition-colors"
            >
              Ir al catálogo
            </Link>
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-700 font-semibold bg-white shadow-sm hover:border-red-400 hover:text-red-800 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            Si el problema persiste, contáctenos y compartí la dirección que intentaste abrir.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
