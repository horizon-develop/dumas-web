import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import type { UserAdminResponse } from "../../user/types/user";
import type { Profile } from "../../user/types/profile";
import { fetchAllUsers, deleteUser, updateUser } from "../api/userAdminApi";
import { registerUser, registerAdmin } from "../../auth/api/authApi";
import AdminCard from "./ui/AdminCard";
import { getErrorMessage } from "../../../shared/types/apiError";

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDebt = (debt: number | null | undefined) => {
  if (debt == null) return "$0,00";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(debt);
};

const AdminUsers = () => {
  const [users, setUsers] = useState<UserAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 8;
  const [editingUser, setEditingUser] = useState<UserAdminResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile: "PETSHOP" as Profile,
    taxId: "",
    legalCompanyName: "",
    phoneNumber: "",
    isAdmin: false
  });

  const fetchUsers = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAllUsers(page, PAGE_SIZE);
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements ?? 0);
    } catch (error) {
      setError(getErrorMessage(error));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        const success = await deleteUser(id);
        if (success) {
          toast.success(
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Usuario eliminado correctamente</span>
            </div>
          );
          fetchUsers();
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updatedUser = await updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        taxId: editingUser.clientDetails?.taxId,
        legalCompanyName: editingUser.clientDetails?.legalCompanyName,
        phoneNumber: editingUser.clientDetails?.phoneNumber,
        profile: editingUser.clientDetails?.profile
      });

      setUsers(prev => prev.map(user =>
        user.id === editingUser.id ? updatedUser : user
      ));

      toast.success("Usuario actualizado correctamente");
      setEditingUser(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newUser.password !== newUser.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }

      if (newUser.isAdmin) {
        await registerAdmin({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
        });
      } else {
        await registerUser({
          email: newUser.email,
          password: newUser.password,
          profile: newUser.profile,
          taxId: newUser.taxId,
          legalCompanyName: newUser.legalCompanyName,
          phoneNumber: newUser.phoneNumber,
        });
      }

      toast.success(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Usuario creado exitosamente</span>
        </div>
      );

      setShowCreateModal(false);
      setCurrentPage(0);
      fetchUsers(0);
      setNewUser({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        profile: "PETSHOP",
        taxId: "",
        legalCompanyName: "",
        phoneNumber: "",
        isAdmin: false
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error al cargar usuarios</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchUsers()}
            className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 sm:pb-4">
          Gestión de Usuarios ({totalElements})
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000] flex items-center whitespace-nowrap"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {!Array.isArray(users) ? (
        <div className="text-center text-red-500">
          Error: Los datos de usuarios no son válidos
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500">
          No hay usuarios registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {users.map((user) => (
            <AdminCard key={user.id} className="p-4 sm:p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-700 truncate">
                    {user.name || 'Sin nombre'}
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1 truncate" title={user.email}>
                    {user.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      user.role === "ADMINISTRADOR"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                      }`}>
                      {user.role === "ADMINISTRADOR" ? user.role : user.clientDetails?.profile || 'CLIENTE'}
                    </span>
                    {user.isGoogleLogin && (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Google
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-gray-600 hover:text-blue-600 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-gray-600 hover:text-red-600 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {user.role !== "ADMINISTRADOR" && user.clientDetails && (
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                  {user.clientDetails.legalCompanyName && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="font-medium text-gray-500 w-24 flex-shrink-0">Razón Social</span>
                      <span className="truncate">{user.clientDetails.legalCompanyName}</span>
                    </div>
                  )}
                  {user.clientDetails.taxId && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="font-medium text-gray-500 w-24 flex-shrink-0">CUIT/CUIL</span>
                      <span>{user.clientDetails.taxId}</span>
                    </div>
                  )}
                  {user.clientDetails.phoneNumber && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="font-medium text-gray-500 w-24 flex-shrink-0">Teléfono</span>
                      <span>{user.clientDetails.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="font-medium text-gray-500 w-24 flex-shrink-0">Deuda</span>
                    <span className={user.clientDetails.currentDebt && user.clientDetails.currentDebt > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                      {formatDebt(user.clientDetails.currentDebt)}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                <span title="Fecha de creación">Creado: {formatDate(user.createdAt)}</span>
                <span title="Última actualización">Actualizado: {formatDate(user.updatedAt)}</span>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            Página {currentPage + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Primera página"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Última página"
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario - Mejorado */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Editar Usuario</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  required
                />
              </div>
              
              {editingUser.role !== "ADMINISTRADOR" && editingUser.clientDetails && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Perfil <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingUser.clientDetails.profile}
                    onChange={(e) => setEditingUser({ 
                      ...editingUser, 
                      clientDetails: {
                        ...editingUser.clientDetails!,
                        profile: e.target.value as Profile
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  >
                    <option value="PETSHOP">PETSHOP</option>
                    <option value="VETERINARIA">VETERINARIA</option>
                    <option value="FORRAJERIA">FORRAJERIA</option>
                  </select>
                </div>
              )}
              
              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6A0000] transition-colors text-sm"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Usuario - Mejorado */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Nuevo Usuario</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4">
              {/* Checkbox Admin - Primero para que condicione el resto */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUser.isAdmin}
                    onChange={(e) => {
                      setNewUser({
                        ...newUser,
                        isAdmin: e.target.checked,
                      });
                    }}
                    className="w-4 h-4 text-red-800 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">¿Es administrador?</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={newUser.confirmPassword}
                      onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                      className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {!newUser.isAdmin && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700">Información del cliente</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perfil <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newUser.profile}
                      onChange={(e) => setNewUser({ ...newUser, profile: e.target.value as Profile })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    >
                      <option value="PETSHOP">PETSHOP</option>
                      <option value="VETERINARIA">VETERINARIA</option>
                      <option value="FORRAJERIA">FORRAJERIA</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CUIT/CUIL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.taxId}
                        onChange={(e) => setNewUser({ ...newUser, taxId: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        placeholder="20-12345678-9"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={newUser.phoneNumber}
                        onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        placeholder="+54 9 11 1234-5678"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razón Social <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newUser.legalCompanyName}
                      onChange={(e) => setNewUser({ ...newUser, legalCompanyName: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="Nombre legal de la empresa"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6A0000] transition-colors text-sm"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;