"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getUserData, verifySession } from "./auth/utils/authUtils";
import { Toaster, toast } from "react-hot-toast";
import { MercadoPagoProvider } from "./payment/api/MercadoPagoContext";
import { CartProvider } from "./cart/context/CartContext";
import Navbar from "../shared/components/Navbar";
import Footer from "../shared/components/Footer";
import Dashboard from "../shared/components/Dashboard";
import ContactPage from "../shared/components/ContactPage";
import AboutUs from "../shared/components/AboutUs";
import LandingPage from "../shared/components/Landing";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import ErrorPage from "../shared/components/ErrorPage";

import Login from "./auth/components/Login";
import Register from "./auth/components/Register";
import Profile from "./user/components/Profile";
import ChangePassword from "./user/components/Password/ChangePassword";

import CartPage from "./cart/components/CartPage";
import Checkout from "./cart/components/Checkout";

import AdminDashboard from "./admin/components/AdminDashboard";
import AdminCoupons from "./admin/components/AdminCoupons";
import AdminProducts from "./admin/components/AdminProducts";
import AdminUsers from "./admin/components/AdminUsers";
import AdminOrders from "./admin/components/AdminOrders";
import AdminOrderDetail from "./admin/components/AdminOrderDetails";
import AdminBrands from "./admin/components/AdminBrands";
import AdminCategories from "./admin/components/AdminCategories";
import ProductList from "./product/components/ProductList";
import { ProductFiltersProvider } from "./product/providers/ProductFiltersProvider";

import PaymentStatusPage from "./payment/components/PaymentStatusPage";

import OrderConfirmationPage from "./order/components/OrderConfirmationPage";
import Order from "./order/components/Order";
import { useLocation } from "react-router-dom";

const AdminRedirect = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

const AuthRedirectHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const logoutToastShown = useRef(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      const returnTo = location.pathname + location.search;
      sessionStorage.setItem("postLoginRedirect", returnTo);

      if (!logoutToastShown.current) {
        const message = detail?.reason === "refresh_token_error"
          ? "Tu sesión expiró. Inicia sesión nuevamente para continuar."
          : "Tu sesión ha finalizado. Por favor vuelve a iniciar sesión para seguir con tu pedido.";
        toast.error(message, { duration: 4000, position: "top-right" });
        logoutToastShown.current = true;
        setTimeout(() => { logoutToastShown.current = false; }, 5000);
      }

      window.dispatchEvent(new Event("auth-open-login"));
    };
    window.addEventListener("auth-logout", handler);
    return () => window.removeEventListener("auth-logout", handler);
  }, [location.pathname, location.search]);

  return <>{children}</>;
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const user = getUserData();
  const location = useLocation();
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!user && !triggered) {
      const returnTo = location.pathname + location.search;
      sessionStorage.setItem("postLoginRedirect", returnTo);
      window.dispatchEvent(new Event("auth-open-login"));
      setTriggered(true);
    }
  }, [user, triggered, location.pathname, location.search]);

  if (!user) return null;
  return <>{children}</>;
};

const ClientRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  let userRole = null;
  
  if (user && user !== "undefined") {
    try {
      userRole = JSON.parse(user)?.role;
    } catch {
      userRole = null;
    }
  }
  
  if (userRole === "ADMINISTRADOR") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [toastShown, setToastShown] = useState(() => sessionStorage.getItem("welcomeToastShown") === "true");

  useEffect(() => {
    const verify = async () => {
      const existingUser = getUserData();
      if (existingUser) {
        const verifiedUser = await verifySession();
        if (verifiedUser) {
          setUserRole(verifiedUser.role || null);
          window.dispatchEvent(new CustomEvent('auth-login', { detail: verifiedUser }));
        } else {
          setUserRole(null);
          window.dispatchEvent(new Event('auth-change'));
        }
      }
    };

    verify();
  }, []);

  useEffect(() => {
    const handleAuthChange = (event?: CustomEvent) => {
      let user = null;
      if (event?.detail) {
        user = event.detail;
      } else {
        const raw = localStorage.getItem("user");
        if (raw && raw !== "undefined") {
          try {
            user = JSON.parse(raw);
          } catch {
            user = null;
          }
        }
      }
      setUserRole(user?.role || null);
    };

    const authListener = (e: Event) => handleAuthChange(e as CustomEvent);
    const logoutListener = () => handleAuthChange();

    window.addEventListener("auth-login", authListener);
    window.addEventListener("auth-logout", logoutListener);
    window.addEventListener("auth-change", logoutListener);

    handleAuthChange();

    return () => {
      window.removeEventListener("auth-login", authListener);
      window.removeEventListener("auth-logout", logoutListener);
      window.removeEventListener("auth-change", logoutListener);
    };
  }, []);

  useEffect(() => {
    const user = getUserData();

    if (!user && !toastShown) {
      const timer = setTimeout(() => {
        toast(
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              ¡Bienvenido! Inicia sesión o regístrate para acceder a todas las
              funcionalidades
            </span>
          </div>,
          {
            position: "top-right",
            duration: 6000,
          }
        );
        sessionStorage.setItem("welcomeToastShown", "true");
        setToastShown(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [toastShown]);

  const shouldShowNavbar = userRole !== "ADMINISTRADOR";

  return (
    <Router>
      <MercadoPagoProvider>
        <CartProvider>
         <AuthRedirectHandler>
           {shouldShowNavbar && <Navbar />}
           <Routes>
             <Route 
               path="/"
               element={
                 userRole === "ADMINISTRADOR" 
                   ? <AdminRedirect /> 
    : (
        <ProductFiltersProvider>
          <LandingPage />
        </ProductFiltersProvider>
      )
             }
           />
             <Route 
               path="/shop" 
               element={
                 <ClientRoute>
                   <ProductFiltersProvider>
                     <ProductList />
                   </ProductFiltersProvider>
                 </ClientRoute>
               } 
             />
             <Route 
               path="/nosotros" 
               element={
                 <ClientRoute>
                   <AboutUs />
                 </ClientRoute>
               } 
             />
             <Route 
               path="/contacto" 
               element={
                 <ClientRoute>
                   <ContactPage />
                 </ClientRoute>
               } 
             />
             <Route 
             path="/dashboard" 
             element={
               <ClientRoute>
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                </ClientRoute>
              } 
            />
            <Route 
             path="/carrito" 
             element={
                <ClientRoute>
                  <CartPage />
                </ClientRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ClientRoute>
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                </ClientRoute>
              } 
            />
             <Route path="*" element={<ErrorPage />} />

             {/* Rutas de admin - protegidas */}
             <Route
               path="/admin/dashboard"
               element={
                 <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
                   <AdminDashboard />
                 </ProtectedRoute>
               }
             >
               <Route path="usuarios" element={<AdminUsers />} />
               <Route path="cupones" element={<AdminCoupons />} />
               <Route path="productos" element={<AdminProducts />} />
               <Route path="marcas" element={<AdminBrands />} />
               <Route path="categorias" element={<AdminCategories />} />
               <Route path="pedidos" element={<AdminOrders />} />
               <Route path="pedidos/:orderId" element={<AdminOrderDetail />} />
             </Route>

             {/* Rutas de autenticación - accesibles para ambos roles */}
             <Route path="/login" element={<Login />} />
             <Route path="/registro" element={<Register />} />
             
             {/* Rutas de password - accesibles para ambos roles */}
             <Route
               path="/change-password"
               element={
                 <ChangePassword
                   onBack={() => window.history.back()}
                   onClose={() => window.history.back()}
                 />
               }
             />

             {/* Rutas específicas del cliente (admin será redirigido) */}
             <Route 
              path="/perfil"
              element={
                <ClientRoute>
                  <RequireAuth>
                    <Profile onClose={() => window.history.back()} />
                  </RequireAuth>
                </ClientRoute>
              }
            />
            <Route 
              path="/order/:orderId" 
              element={
                <ClientRoute>
                  <RequireAuth>
                    <Order />
                  </RequireAuth>
                </ClientRoute>
              } 
            />
            <Route 
              path="/payment/success" 
              element={
                <ClientRoute>
                  <RequireAuth>
                    <PaymentStatusPage />
                  </RequireAuth>
                </ClientRoute>
              } 
            />
            <Route 
              path="/payment/pending" 
              element={
                <ClientRoute>
                  <RequireAuth>
                    <PaymentStatusPage />
                  </RequireAuth>
                </ClientRoute>
              } 
            />
            <Route 
              path="/payment/failure" 
              element={
                <ClientRoute>
                  <RequireAuth>
                    <PaymentStatusPage />
                  </RequireAuth>
                </ClientRoute>
              } 
            />
            <Route
              path="/order-confirmation/:orderId"
              element={
                <ClientRoute>
                  <RequireAuth>
                    <OrderConfirmationPage />
                  </RequireAuth>
                </ClientRoute>
              }
            />
          </Routes>
          {shouldShowNavbar && <Footer />}

         {/* Toast container global */}
          <Toaster
           position="top-right"
          containerClassName="app-toast-container"
           containerStyle={{ zIndex: 99999 }}
           toastOptions={{
            duration: 3500,
           }}
          />
         </AuthRedirectHandler>
       </CartProvider>
      </MercadoPagoProvider>
    </Router>
  );
}

export default App;
