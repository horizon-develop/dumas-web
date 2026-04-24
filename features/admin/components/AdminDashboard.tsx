import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import { useEffect, useState } from "react";
import { getValidCouponsCount } from "../../coupon/api/couponService";
import { getClientUsersCount } from "../../user/api/userApi";
import { getOrdersLastMonthCount } from "../api/orderAdminApi";
import { Link, Outlet, useLocation } from "react-router-dom";

const AdminDashboard = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const [activeCouponsCount, setActiveCouponsCount] = useState<number | null>(null);
  const [clientUsersCount, setClientUsersCount] = useState<number | null>(null);
  const [ordersLastMonthCount, setOrdersLastMonthCount] = useState<number | null>(null);
  const isDashboard = location.pathname === "/admin/dashboard";

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [couponsCount, usersCount, ordersCount] = await Promise.all([
          getValidCouponsCount(),
          getClientUsersCount(),
          getOrdersLastMonthCount()
        ]);
        setActiveCouponsCount(couponsCount);
        setClientUsersCount(usersCount);
        setOrdersLastMonthCount(ordersCount);
      } catch (err) {
        setActiveCouponsCount(0);
        setClientUsersCount(0);
        setOrdersLastMonthCount(0);
      }
    };
    fetchCounts();
  }, []);

  const stats = [
    {
      title: "Cupones Vigentes",
      value: activeCouponsCount === null ? "—" : String(activeCouponsCount),
      icon: "🎫",
      color: "from-[#FFD700]/20 to-[#FFD700]/5",
      textColor: "text-[#B8860B]"
    },
    {
      title: "Pedidos de Este Mes",
      value: ordersLastMonthCount === null ? "—" : String(ordersLastMonthCount),
      icon: "🛒",
      color: "from-[#8B0000]/20 to-[#8B0000]/5",
      textColor: "text-[#8B0000]"
    },
    {
      title: "Clientes Registrados",
      value: clientUsersCount === null ? "—" : String(clientUsersCount),
      icon: "👥",
      color: "from-[#006400]/20 to-[#006400]/5",
      textColor: "text-[#006400]"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <AdminSidebar />
      <div className="flex-1 lg:ml-72 p-4 lg:p-8 overflow-y-auto">
        {isDashboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-2xl shadow-xl p-6 relative overflow-hidden`}
              >
                <div className="flex justify-between items-start">
                  <div className="z-10">
                    <h3 className={`text-sm font-semibold ${stat.textColor} mb-2`}>
                      {stat.title}
                    </h3>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    <div className="flex items-center mt-2">
                    </div>
                    {stat.title === "Cupones Activos" && activeCouponsCount === 0 && (
                      <div className="mt-3">
                        <Link
                          to="/admin/dashboard/cupones"
                          className="inline-block bg-[#8B0000] text-white px-3 py-1.5 rounded-lg hover:bg-[#6A0000] text-sm"
                        >
                          Crear cupón
                        </Link>
                      </div>
                    )}
                    {stat.title === "Usuarios Registrados" && clientUsersCount === 0 && (
                      <div className="mt-3">
                        <Link
                          to="/admin/dashboard/usuarios"
                          className="inline-block bg-[#006400] text-white px-3 py-1.5 rounded-lg hover:bg-green-800 text-sm"
                        >
                          Crear usuario
                        </Link>
                      </div>
                    )}
                    {stat.title === "Pedidos de Este Mes" && ordersLastMonthCount === 0 && (
                      <div className="mt-3">
                        <Link
                          to="/admin/dashboard/pedidos"
                          className="inline-block bg-[#8B0000] text-white px-3 py-1.5 rounded-lg hover:bg-[#6A0000] text-sm"
                        >
                          Ver pedidos
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="text-4xl z-10">{stat.icon}</div>
                </div>
                
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm" />
              </motion.div>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-4 lg:p-6"
          >
            {children || <Outlet />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;