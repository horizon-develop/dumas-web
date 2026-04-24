import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { clearUserData } from "../../auth/utils/authUtils";
import ChangePassword from "../../user/components/Password/ChangePassword";
import Profile from "../../user/components/Profile";
import { Bars3Icon, XMarkIcon, HomeIcon, ClipboardDocumentListIcon, UsersIcon, TicketIcon, ShoppingCartIcon, UserCircleIcon, ArrowRightOnRectangleIcon, TagIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

interface AdminSidebarProps { }

const sidebarVariants = {
  hidden: { x: "-100%", transition: { duration: 0.3 } },
  visible: { x: "0", transition: { duration: 0.3 } },
};

const AdminSidebar: React.FC<AdminSidebarProps> = () => {
  const [currentView, setCurrentView] = useState<"menu" | "perfil" | "changePassword">("menu");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUserData();
    window.dispatchEvent(new CustomEvent("auth-logout"));

    toast.success(
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Sesión cerrada correctamente</span>
      </div>
    );

    navigate("/");
  };

  const sidebarContent = (
    <>
      {currentView === "menu" ? (
        <>
          <Link to="/admin/dashboard">
            <h2 className="text-xl font-bold mb-6 text-[#8B0000] border-b border-gray-200 pb-4 hover:text-[#8B0000]/80 transition-colors">
              Panel Administrador
            </h2>
          </Link>

          <nav className="space-y-2">
            <NavLink
              to="/admin/dashboard/usuarios"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#8B0000]/10 text-[#8B0000] font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              <UsersIcon className="h-5 w-5 mr-2" />
              Usuarios
            </NavLink>

            <NavLink
              to="/admin/dashboard/cupones"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#8B0000]/10 text-[#8B0000] font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              <TicketIcon className="h-5 w-5 mr-2" />
              Cupones
            </NavLink>

            <NavLink
              to="/admin/dashboard/productos"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#8B0000]/10 text-[#8B0000] font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Productos
            </NavLink>

            <NavLink
              to="/admin/dashboard/marcas"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#8B0000]/10 text-[#8B0000] font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              <TagIcon className="h-5 w-5 mr-2" />
              Marcas
            </NavLink>

            <NavLink
              to="/admin/dashboard/categorias"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#8B0000]/10 text-[#8B0000] font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              <Squares2X2Icon className="h-5 w-5 mr-2" />
              Categorías
            </NavLink>

            <NavLink
              to="/admin/dashboard/pedidos"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#8B0000]/10 text-[#8B0000] font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
              Pedidos
            </NavLink>

            <NavLink
              to="/admin/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#8B0000]/10 text-[#8B0000] font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Dashboard
            </NavLink>
          </nav>

          <div className="border-t border-gray-200 my-6"></div>

          <div className="space-y-2">
            <button
              onClick={() => setCurrentView("perfil")}
              className="w-full flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <UserCircleIcon className="h-5 w-5 mr-2" />
              Mi Perfil
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setCurrentView("menu")}
              className="text-gray-600 hover:text-[#8B0000] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {currentView === "perfil" && (
              <Profile
                onClose={() => setCurrentView("menu")}
                onShowChangePassword={() => setCurrentView("changePassword")}
              />
            )}

            {currentView === "changePassword" && (
              <ChangePassword
                onBack={() => setCurrentView("perfil")}
                onClose={() => setCurrentView("menu")}
              />
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Botón hamburguesa para mobile (visible en pantallas pequeñas) */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-white shadow rounded-full focus:outline-none"
        >
          <Bars3Icon className="w-6 h-6 text-[#8B0000]" />
        </button>
      </div>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            className="fixed left-0 top-0 w-72 h-screen bg-white shadow-lg p-6 z-50 overflow-y-auto"
          >
            <div className="flex justify-end md:hidden">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-[#8B0000] transition-colors focus:outline-none"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop: Siempre visible en pantallas medianas en adelante */}
      <div className="hidden md:block">
        <div className="fixed left-0 top-0 w-72 h-screen bg-white shadow-lg p-6 z-50 overflow-y-auto">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
