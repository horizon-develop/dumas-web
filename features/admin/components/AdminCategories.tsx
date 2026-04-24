import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { CategoryResponse } from "../../category/types/categoryDto";
import {
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoryAdminApi";
import AdminCard from "./ui/AdminCard";
import { getErrorMessage } from "../../../shared/types/apiError";


const AdminCategories = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategory, setNewCategory] = useState<{ name: string }>({
    name: "",
  });

  const fetchCategories = async () => {
    try {
      const data = await getAllCategoriesAdmin();
      setCategories(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar esta categoría? Esto podría afectar a los productos asociados.")) {
      try {
        await deleteCategory(id);
        toast.success(
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Categoría eliminada correctamente</span>
          </div>
        );
        fetchCategories();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(newCategory);
      toast.success(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Categoría creada exitosamente</span>
        </div>
      );
      setShowCreateModal(false);
      fetchCategories();
      setNewCategory({ name: "" });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      await updateCategory(editingCategory.id, { name: editingCategory.name });
      toast.success(
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Categoría actualizada correctamente</span>
        </div>
      );
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Gestión de Categorías</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000] flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 mb-6">
          <div className="text-5xl mb-3">📁</div>
          <h2 className="text-lg font-semibold text-gray-700">No hay categorías registradas</h2>
          <p className="text-gray-500 mt-1">Crea tu primera categoría para organizar tus productos.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000]"
          >
            Crear categoría
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <AdminCard key={category.id}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">{category.name}</h2>
                <p className="text-gray-400 text-xs mt-1">ID: {category.id}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="text-gray-600 hover:text-blue-600"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
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

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Categoría</h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nueva Categoría</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Ej: Alimentos, Accesorios, etc."
                  required
                />
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
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
