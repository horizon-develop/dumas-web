import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiUser, FiX, FiArrowLeft, FiMenu, FiHome, FiInfo, FiMail, FiBox, FiZap } from "react-icons/fi";
import LiveSearchBar from "./LiveSearchBar";
import Login from "../../features/auth/components/Login";
import Register from "../../features/auth/components/Register";
import Profile from "../../features/user/components/Profile";
import ChangePassword from "../../features/user/components/Password/ChangePassword";
import AddressManager from "../../features/user/components/AddressManager";
import QuickCartModal from "../../features/cart/components/QuickCart/QuickCartModal";
import { useCart } from "../../features/cart/context/CartContext";
import { logout } from "../../features/auth/utils/authUtils";


type SidebarContent = "menu" | "login" | "register" | "perfil" | "changePassword" | "addresses";

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}


const NAVIGATION_ITEMS: NavigationItem[] = [
  { name: "Inicio", icon: <FiHome />, path: "/" },
  { name: "Shop", icon: <FiShoppingCart />, path: "/shop" },
  { name: "Nosotros", icon: <FiInfo />, path: "/nosotros" },
  { name: "Contacto", icon: <FiMail />, path: "/contacto" },
  { name: "Mis Pedidos", icon: <FiBox />, path: "/dashboard" }
];

const DESKTOP_LINKS = ["Shop", "Nosotros", "Contacto", "Mis Pedidos"];


const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    const checkAuth = () => {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      const role = user ? user.role : null;

      setIsAuthenticated(!!user);
      setUserRole(role);
    };

    useEffect(() => {
      checkAuth();
      const handleAuthChange = () => checkAuth();

      window.addEventListener("auth-change", handleAuthChange);
      window.addEventListener("auth-login", handleAuthChange);
      window.addEventListener("auth-logout", handleAuthChange);
      window.addEventListener("storage", handleAuthChange);

      return () => {
        window.removeEventListener("auth-change", handleAuthChange);
        window.removeEventListener("auth-login", handleAuthChange);
        window.removeEventListener("auth-logout", handleAuthChange);
        window.removeEventListener("storage", handleAuthChange);
      };
    }, []);

    return { isAuthenticated, userRole };
  };


const Navbar: React.FC = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarStack, setSidebarStack] = useState<SidebarContent[]>(["menu"]);
  const [showQuickCart, setShowQuickCart] = useState(false);
  const sidebarContent = sidebarStack[sidebarStack.length - 1] || "menu";

  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const lastLoginOpen = useRef<number>(0);


  useEffect(() => {
    if (isAuthenticated) {
      setSidebarStack(["menu"]);
    }
  }, [isAuthenticated]);


  const getSuccessIcon = () => (
    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const getInfoIcon = () => (
    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const showToast = (type: 'success' | 'info', message: string, duration: number = 3000) => {
    const toastConfig = {
      position: "top-right" as const,
      duration,
    };

    const icon = type === 'success' ? getSuccessIcon() : getInfoIcon();
    const content = (
      <div className="flex items-center">
        {icon}
        <span className={type === 'info' ? 'font-medium text-gray-800' : ''}>{message}</span>
      </div>
    );

    if (type === 'success') {
      toast.success(content, toastConfig);
    } else {
      toast(content, toastConfig);
    }
  };


  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const goToSidebar = (content: SidebarContent) => {
    const target = !isAuthenticated && (content === "perfil" || content === "changePassword" || content === "addresses")
      ? "login"
      : content;

    setSidebarStack(prev => {
      const base: SidebarContent[] = isSidebarOpen ? [...prev] : ["menu"];
      if (target === "menu") return ["menu"] as SidebarContent[];
      if (base[base.length - 1] === target) return base;
      return [...base, target];
    });
    setIsSidebarOpen(true);
  };

  const handleSidebarBack = () => {
    setSidebarStack(prev => {
      if (prev.length > 1) return prev.slice(0, -1);
      return ["menu"] as SidebarContent[];
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setSidebarStack(["menu"]);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsSidebarOpen(false);
  };

  const handleRegisterSuccess = () => {
    setSidebarStack(["menu", "login"] as SidebarContent[]);
    showToast('success', '¡Registro completado exitosamente! Por favor inicia sesión');
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('cartItems');

    window.dispatchEvent(new Event("auth-change"));
    window.dispatchEvent(new Event("cart-update"));

    toast.dismiss();
    toast.success('¡Sesión cerrada correctamente!', { duration: 2000, position: "top-right" });
  };

  const handleCartClick = () => {
    navigate("/carrito");

    const message = itemCount === 0
      ? "Tu carrito está vacío"
      : `Tu carrito tiene ${itemCount} producto${itemCount !== 1 ? 's' : ''}`;

    showToast('info', message, 2000);
  };

  useEffect(() => {
    const openLogin = () => {
      const now = Date.now();
      if (now - lastLoginOpen.current < 600) return;
      lastLoginOpen.current = now;
      goToSidebar("login");
    };
    const openRegister = () => {
      goToSidebar("register");
    };
    window.addEventListener("auth-open-login", openLogin);
    window.addEventListener("auth-open-register", openRegister);
    return () => {
      window.removeEventListener("auth-open-login", openLogin);
      window.removeEventListener("auth-open-register", openRegister);
    };
  }, []);

  const handleLoginSuccess = () => {
    window.dispatchEvent(new Event("auth-change"));
    setIsSidebarOpen(false);
  };

  const handleProtectedNavigation = (
    path: string,
    onAllowed?: () => void
  ) => (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (path === "/dashboard" && !isAuthenticated) {
      e.preventDefault();
      goToSidebar("login");
      setIsMenuOpen(false);
      return;
    }
    onAllowed?.();
  };

  const handleQuickCartClick = () => {
    setShowQuickCart(true);
    closeAllMenus();
  };


  const MobileMenu = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="lg:hidden fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeAllMenus} />

          <motion.div
            className="absolute top-20 right-2 left-2 sm:right-4 sm:left-auto sm:w-80 md:w-96 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-4 space-y-4"
            role="menu"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Menú</h2>
              <button
                onClick={closeAllMenus}
                className="p-1 text-gray-500 hover:text-red-600 rounded-full transition-colors"
                aria-label="Cerrar menú"
              >
                <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="md:hidden mb-4">
              <LiveSearchBar />
            </div>

            <nav className="space-y-2">
              {NAVIGATION_ITEMS.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.path}
                    onClick={handleProtectedNavigation(item.path, closeAllMenus)}
                    className="flex items-center p-3 space-x-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm sm:text-base"
                    role="menuitem"
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </motion.div>
              ))}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={handleQuickCartClick}
                  className="flex items-center p-3 space-x-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full text-left text-sm sm:text-base"
                >
                  <FiZap />
                  <span className="font-medium">Pedido rápido</span>
                </button>
              </motion.div>
            </nav>

            {isAuthenticated && (
              <motion.div
                className="pt-4 border-t border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 border-2 border-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Cerrar sesión</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const DesktopNavigation = () => (
    <div className="hidden lg:flex items-center space-x-1 xl:space-x-4">
      {DESKTOP_LINKS.map((name, index) => (
        <Link
          key={index}
          to={name === "Mis Pedidos" ? "/dashboard" : `/${name.toLowerCase().replace(' ', '-')}`}
          className="relative group px-3 xl:px-4 py-2 text-sm xl:text-base text-gray-700 hover:text-red-600 transition-colors"
          onClick={handleProtectedNavigation(name === "Mis Pedidos" ? "/dashboard" : `/${name.toLowerCase().replace(' ', '-')}`)}
        >
          {name}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-red-600 w-0 group-hover:w-full transition-all"
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
          />
        </Link>
      ))}

      <button
        onClick={() => setShowQuickCart(true)}
        className="relative group px-3 xl:px-4 py-2 text-sm xl:text-base text-gray-700 hover:text-red-600 transition-colors"
      >
        Pedido rápido
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-[#8B0000] w-0 group-hover:w-full transition-all"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
        />
      </button>
    </div>
  );

  const ActionIcons = () => (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <button
        onClick={handleCartClick}
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
            {itemCount > 99 ? '99+' : itemCount}
          </motion.span>
        )}
      </button>

      <button
        onClick={toggleSidebar}
        className="p-2 text-red-600 hover:text-red-700 transition-colors"
        aria-label="Perfil de usuario"
      >
        <FiUser className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <button
        onClick={toggleMenu}
        className="lg:hidden p-2 text-red-600 hover:text-red-700 relative"
        aria-label="Abrir menú"
        aria-expanded={isMenuOpen}
      >
        <FiMenu className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
    </div>
  );

  const Sidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-30"
            onClick={toggleSidebar}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed top-0 right-0 w-full max-w-sm sm:max-w-md lg:max-w-lg h-screen bg-white shadow-xl z-40 overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <button
                onClick={handleSidebarBack}
                className="text-red-600 hover:text-red-700"
              >
                <FiArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={toggleSidebar}
                className="text-red-600 hover:text-red-700"
              >
                <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {sidebarContent === "menu" ? (
                <>
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => goToSidebar("perfil")}
                        className="w-full px-4 py-3 text-sm sm:text-base text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        Mi Perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-sm sm:text-base text-red-600 border-2 border-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => goToSidebar("login")}
                        className="w-full px-4 py-3 text-sm sm:text-base text-white bg-[#8B0000] hover:bg-[#6A0000] rounded-lg transition-colors"
                      >
                        Iniciar sesión
                      </button>
                      <button
                        onClick={() => goToSidebar("register")}
                        className="w-full px-4 py-3 text-sm sm:text-base text-red-600 border-2 border-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Registrarse
                      </button>
                    </>
                  )}
                </>
              ) : sidebarContent === "login" ? (
                <Login
                  onLoginSuccess={handleLoginSuccess}
                />
              ) : sidebarContent === "register" ? (
                <Register onSuccess={handleRegisterSuccess} />
              ) : sidebarContent === "perfil" ? (
                <Profile
                  onClose={toggleSidebar}
                  onShowChangePassword={() => goToSidebar("changePassword")}
                  onShowAddresses={() => goToSidebar("addresses")}
                />
              ) : sidebarContent === "addresses" ? (
                <AddressManager
                  onBack={() => goToSidebar("perfil")}
                />
              ) : (
                <ChangePassword
                  onBack={() => goToSidebar("perfil")}
                  onClose={toggleSidebar}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );



  if (userRole === "ADMINISTRADOR") return null;

  return (
    <nav className="bg-white shadow-md relative z-40 font-sans">
      <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex flex-wrap items-center justify-between h-auto min-h-[56px] sm:min-h-[72px] lg:min-h-[80px]">

          <Link to="/" className="flex-shrink-0 min-w-0">
            <motion.img
              src="/assets/Logo/Logo.png"
              alt="Logo"
              className="h-8 sm:h-10 lg:h-14 max-w-[160px] w-auto"
              style={{ height: "auto", maxWidth: "160px", width: "100%" }}
              whileHover={{ scale: 1.05 }}
              loading="lazy"
            />
          </Link>

          <DesktopNavigation />

          <div className="hidden md:block flex-1 min-w-0 max-w-xs lg:max-w-sm xl:max-w-md 2xl:max-w-lg mx-2 lg:mx-4">
            <LiveSearchBar />
          </div>

          <ActionIcons />
        </div>
      </div>

      <MobileMenu />
      <Sidebar />

      {showQuickCart && <QuickCartModal onClose={() => setShowQuickCart(false)} />}
    </nav>
  );
};

export default Navbar;
