"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiUser,
  FiX,
  FiArrowLeft,
  FiMenu,
  FiHome,
  FiBox,
} from "react-icons/fi";
import { useCart } from "@/features/cart/context/CartContext";

const NAV_LINKS = [
  { name: "Inicio", icon: <FiHome />, path: "/" },
  { name: "Catálogo", icon: <FiShoppingCart />, path: "/shop" },
  { name: "Mis Pedidos", icon: <FiBox />, path: "/mi-cuenta" },
];

const Navbar: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { itemCount } = useCart();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAuthenticated = !!session;
  const isAdmin = session?.user?.role === "ADMIN";

  const handleLogout = async () => {
    setIsSidebarOpen(false);
    await signOut({ redirectTo: "/" });
  };

  if (isAdmin) return null;

  return (
    <nav className="bg-white shadow-md relative z-40 font-sans">
      <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 lg:h-20">
          <Link href="/" className="flex-shrink-0">
            <motion.img
              src="/assets/Logo/Logo.png"
              alt="Dumas Distribuciones"
              className="h-8 sm:h-10 lg:h-14 w-auto max-w-[160px]"
              whileHover={{ scale: 1.05 }}
              loading="lazy"
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-1 xl:space-x-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="relative group px-3 xl:px-4 py-2 text-sm xl:text-base text-gray-700 hover:text-red-600 transition-colors"
              >
                {item.name}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-red-600 w-0 group-hover:w-full transition-all"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/carrito"
              className="relative p-2 text-red-600 hover:text-red-700 transition-colors"
              aria-label="Ver carrito"
            >
              <FiShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </motion.span>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-red-600 hover:text-red-700 transition-colors"
              aria-label="Perfil de usuario"
            >
              <FiUser className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 text-red-600 hover:text-red-700"
              aria-label="Abrir menú"
            >
              <FiMenu className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-30"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed top-0 right-0 w-full max-w-sm h-screen bg-white shadow-xl z-40 overflow-y-auto"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <span className="font-semibold text-gray-800">
                  {isAuthenticated ? `Hola, ${session.user?.name?.split(" ")[0]}` : "Mi cuenta"}
                </span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/mi-cuenta"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block w-full px-4 py-3 text-center text-white bg-[#8B0000] hover:bg-[#6A0000] rounded-lg font-semibold transition-colors"
                    >
                      Mi perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-red-600 border-2 border-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block w-full px-4 py-3 text-center text-white bg-[#8B0000] hover:bg-[#6A0000] rounded-lg font-semibold transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block w-full px-4 py-3 text-center text-[#8B0000] border-2 border-[#8B0000] hover:bg-red-50 rounded-lg font-semibold transition-colors"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
