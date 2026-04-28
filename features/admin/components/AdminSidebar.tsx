"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { FiUsers, FiPackage, FiShoppingBag, FiLogOut, FiMenu, FiX } from "react-icons/fi";

const LINKS = [
  { name: "Clientes", icon: FiUsers, href: "/admin/clientes" },
  { name: "Pedidos", icon: FiShoppingBag, href: "/admin/pedidos" },
  { name: "Productos", icon: FiPackage, href: "/admin/productos" },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <div className="flex flex-col h-full p-5">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#8B0000]">Panel Admin</h2>
        <p className="text-xs text-gray-400 mt-0.5">Dumas Distribuciones</p>
      </div>
      <nav className="flex-1 space-y-1">
        {LINKS.map(({ name, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-[#8B0000]/10 text-[#8B0000]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {name}
          </Link>
        ))}
      </nav>
      <button
        onClick={() => signOut({ redirectTo: "/" })}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <FiLogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow border border-gray-200"
        aria-label="Abrir menú"
      >
        <FiMenu className="h-5 w-5 text-[#8B0000]" />
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Cerrar menú"
            >
              <FiX className="h-5 w-5" />
            </button>
            {navContent}
          </div>
        </div>
      )}

      <div className="hidden md:block fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 z-30">
        {navContent}
      </div>
    </>
  );
};

export default AdminSidebar;
