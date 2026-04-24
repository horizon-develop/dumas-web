import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../coupon/api/couponService";
import { getErrorMessage } from "../../../shared/types/apiError";
import { CouponResponse } from "../../coupon/types/couponDto";
import { DiscountType } from "../../coupon/types/discountType";
import AdminCard from "./ui/AdminCard";


const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<CouponResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState<{
    code: string;
    discountType: DiscountType;
    value: number;
    startDate: string;
    endDate: string;
    active: boolean;
  }>({
    code: "",
    discountType: "PORCENTAJE",
    value: 10,
    startDate: "",
    endDate: "",
    active: true,
  });

  const fetchCoupons = async () => {
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este cupón?")) {
      try {
        await deleteCoupon(id);
        toast.success("Cupón eliminado correctamente");
        fetchCoupons();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCoupon(newCoupon);
      toast.success("Cupón creado exitosamente");
      setShowCreateModal(false);
      fetchCoupons();
      setNewCoupon({
        code: "",
        discountType: "PORCENTAJE",
        value: 10,
        startDate: "",
        endDate: "",
        active: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    try {
      await updateCoupon(editingCoupon.id, {
        code: editingCoupon.code,
        discountType: editingCoupon.discountType,
        value: editingCoupon.value,
        startDate: editingCoupon.startDate,
        endDate: editingCoupon.endDate,
        active: editingCoupon.active,
      });
      toast.success("Cupón actualizado correctamente");
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const activeCouponsCount = useMemo(() => coupons.filter(c => c.active).length, [coupons]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Gestión de Cupones</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000] flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cupón
        </button>
      </div>

      {activeCouponsCount === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 mb-6">
          <div className="text-5xl mb-3">🎫</div>
          <h2 className="text-lg font-semibold text-gray-700">No hay cupones activos</h2>
          <p className="text-gray-500 mt-1">Crea tu primer cupón para ofrecer descuentos a tus clientes.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000]"
          >
            Crear cupón
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <AdminCard key={coupon.id}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-700">{coupon.code}</h2>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    coupon.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {coupon.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Descuento: {coupon.discountType === "PORCENTAJE" ? `${coupon.value}%` : `$${coupon.value}`}
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  <p>Inicio: {new Date(coupon.startDate).toLocaleDateString()}</p>
                  <p>Fin: {new Date(coupon.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditingCoupon(coupon)}
                  className="text-gray-600 hover:text-blue-600"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="text-gray-600 hover:text-red-600"
                  title="Eliminar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {editingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Cupón</h2>
              <button
                onClick={() => setEditingCoupon(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  value={editingCoupon.code}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Descuento</label>
                <select
                  value={editingCoupon.discountType}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as DiscountType })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="PORCENTAJE">Porcentaje</option>
                  <option value="MONTO_FIJO">Monto Fijo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <input
                  type="number"
                  value={editingCoupon.value}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, value: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={editingCoupon.startDate}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, startDate: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  value={editingCoupon.endDate}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, endDate: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCoupon.active}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
                  className="w-4 h-4 text-red-800 focus:ring-red-500"
                />
                <label className="text-sm text-gray-700">Activo</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6A0000]"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nuevo Cupón</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Descuento</label>
                <select
                  value={newCoupon.discountType}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as DiscountType })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="PORCENTAJE">Porcentaje</option>
                  <option value="MONTO_FIJO">Monto Fijo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <input
                  type="number"
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={newCoupon.startDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  value={newCoupon.endDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, endDate: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCoupon.active}
                  onChange={(e) => setNewCoupon({ ...newCoupon, active: e.target.checked })}
                  className="w-4 h-4 text-red-800 focus:ring-red-500"
                />
                <label className="text-sm text-gray-700">Activo</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6A0000]"
                >
                  Crear Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;