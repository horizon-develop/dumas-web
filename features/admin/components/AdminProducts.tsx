import React, { useEffect, useState } from "react";
import { fetchAdminProducts, createProduct, updateProduct, deleteProduct } from "../api/productAdminApi";
import { convertBigDecimalToNumber } from "../../../shared/utils/numberUtils";
import { formatCurrency } from "../../../shared/utils/formatters";
import { getAllCategories } from "../../category/api/categoryApi";
import type { CategoryResponse } from "../../category/types/categoryDto";
import { getAllBrands } from "../../brand/api/brandApi";
import type { BrandResponse } from "../../brand/types/brandDto";
import { toast } from "react-hot-toast";
import { uploadProductImage, deleteProductImage } from "../../../shared/services/storage";
import { isAllowedFormat, compressImage } from "../../../shared/utils/imageUtils";
import type { ProductAdminResponse } from "../../product/types/productDto";
import { EditableProduct } from "../../product/types/productInterfaces";
import AdminCard from "./ui/AdminCard";
import { getErrorMessage } from "../../../shared/types/apiError";


const AdminProducts = () => {
  const [products, setProducts] = useState<ProductAdminResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    petshopPrice: 0,
    veterinariaPrice: 0,
    forrajeriaPrice: 0,
    stock: 0,
    category: "",
    brand: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(16);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data || []);
        if (data && data.length > 0 && !newProduct.category) {
          setNewProduct(prev => ({ ...prev, category: data[0].name }));
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    };
    const loadBrands = async () => {
      try {
        const data = await getAllBrands();
        setBrands(data || []);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    };
    loadCategories();
    loadBrands();
  }, []);

  const fetchProductos = async () => {
    try {
      const page = await fetchAdminProducts(currentPage, pageSize);
      setProducts(page.products);
      setTotalPages(page.totalPages);
      setTotalElements(page.totalElements);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProductos();
  }, [currentPage, pageSize]);

  const uploadImageToFirebase = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadProductImage(file, (progress) => {
        setUploadProgress(progress);
      });
      uploadTask
        .then(imageUrl => resolve(imageUrl))
        .catch(error => reject(error));
    });
  };

  const handleImageSelect = async (file: File | undefined) => {
    if (!file) {
      setSelectedImage(null);
      return;
    }
    if (!isAllowedFormat(file)) {
      toast.error("Formato no permitido. Usa JPG, PNG o WebP.");
      return;
    }
    try {
      setIsCompressing(true);
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
    } catch {
      toast.error("Error al comprimir la imagen");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedImage) {
        toast.error("Debes seleccionar una imagen");
        return;
      }

      const imageUrl = await uploadImageToFirebase(selectedImage);

      await createProduct({
        name: newProduct.name,
        description: newProduct.description,
        petshop_price: newProduct.petshopPrice,
        veterinaria_price: newProduct.veterinariaPrice,
        forrajeria_price: newProduct.forrajeriaPrice,
        stock: newProduct.stock,
        category: newProduct.category,
        brand: newProduct.brand,
        url_image: imageUrl
      });

      toast.success("Producto creado exitosamente");
      setShowCreateModal(false);
      fetchProductos();
      setNewProduct({
        name: "",
        description: "",
        petshopPrice: 0,
        veterinariaPrice: 0,
        forrajeriaPrice: 0,
        stock: 0,
        category: categories.length > 0 ? categories[0].name : "",
        brand: "",
      });
      setSelectedImage(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isDefaultImage = (url: string) => {
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl.includes('sin imagen') || decodedUrl.includes('no image');
  };

  const handleDelete = async (id: number, imageUrl?: string) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProduct(id);

        if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com') && !isDefaultImage(imageUrl)) {
          await deleteProductImage(imageUrl);
        }

        toast.success("Producto eliminado correctamente");
        fetchProductos();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      let imageUrl = editingProduct.urlImage;
      if (selectedImage) {
        const oldImageUrl = editingProduct.urlImage;
        if (oldImageUrl && oldImageUrl.includes('firebasestorage.googleapis.com') && !isDefaultImage(oldImageUrl)) {
          await deleteProductImage(oldImageUrl);
        }
        imageUrl = await uploadImageToFirebase(selectedImage);
      }

      const selectedCategory = categories.find(c => c.name === editingProduct.category);
      const selectedBrand = brands.find(b => b.name === editingProduct.brand);

      await updateProduct(editingProduct.id, {
        name: editingProduct.name,
        description: editingProduct.description,
        petshopPrice: convertBigDecimalToNumber(editingProduct.petshopPrice),
        veterinariaPrice: convertBigDecimalToNumber(editingProduct.veterinariaPrice),
        forrajeriaPrice: convertBigDecimalToNumber(editingProduct.forrajeriaPrice),
        stock: Number(editingProduct.stock) || 0,
        category: selectedCategory ? { id: selectedCategory.id, name: selectedCategory.name } : null,
        brand: selectedBrand ? { id: selectedBrand.id, name: selectedBrand.name } : null,
        urlImage: imageUrl
      });

      toast.success("Producto actualizado correctamente");
      setEditingProduct(null);
      setSelectedImage(null);
      setUploadProgress(0);
      fetchProductos();
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
        <h1 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Gestión de Productos</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000] flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Mostrando {products.length} de {totalElements} productos
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Por página:</label>
          <select
            value={pageSize}
            onChange={(e) => { setCurrentPage(0); setPageSize(Number(e.target.value)); }}
            className="p-2 border rounded-md text-sm"
          >
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-lg font-medium mb-2">No hay productos</p>
          <p className="text-sm text-gray-400 mb-4">Comienza agregando tu primer producto</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6A0000] flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <AdminCard key={product.id}>
            <img src={product.urlImage} alt={product.name} className="w-full h-48 object-cover mb-4 rounded-lg" />
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">{product.name}</h2>
                <div className="text-gray-500 text-sm mt-1">
                  <p>Petshop: {formatCurrency(product.petshopPrice)}</p>
                  <p>Veterinaria: {formatCurrency(product.veterinariaPrice)}</p>
                  <p>Forrajería: {formatCurrency(product.forrajeriaPrice)}</p>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  <p>Stock: {product.stock}</p>
                  <p>Categoría: {product.category?.name}</p>
                  <p>Marca: {product.brand?.name}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditingProduct({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    petshopPrice: product.petshopPrice,
                    veterinariaPrice: product.veterinariaPrice,
                    forrajeriaPrice: product.forrajeriaPrice,
                    stock: product.stock,
                    category: product.category?.name,
                    brand: product.brand?.name,
                    urlImage: product.urlImage
                  })}
                  className="text-gray-600 hover:text-blue-600"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.urlImage)}
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
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nuevo Producto</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre*</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Petshop*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.petshopPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, petshopPrice: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Veterinaria*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.veterinariaPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, veterinariaPrice: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Forrajería*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.forrajeriaPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, forrajeriaPrice: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock*</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría*</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm"
                    required
                  >
                    {categories.length === 0 ? (
                      <option value="">Cargando...</option>
                    ) : (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Imagen*</label>
                <input
                  type="file"
                  onChange={(e) => handleImageSelect(e.target.files?.[0])}
                  accept=".webp,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-red-800 file:text-white hover:file:bg-red-900"
                  required
                />
                {isCompressing && (
                  <p className="text-xs text-gray-500 mt-1">Comprimiendo imagen...</p>
                )}
                {selectedImage && !isCompressing && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Vista previa ({(selectedImage.size / 1024).toFixed(0)} KB - WebP):
                    </p>
                    <div className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Vista previa"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                {uploadProgress > 0 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-800 h-2 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Marca*</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm h-24"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B0000] text-white text-sm rounded-md hover:bg-[#6A0000]"
                  disabled={categories.length === 0}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Producto - Con categorías dinámicas */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Producto</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm h-24"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Petshop</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.petshopPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, petshopPrice: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Veterinaria</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.veterinariaPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, veterinariaPrice: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Forrajería</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.forrajeriaPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, forrajeriaPrice: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    {categories.length === 0 ? (
                      <option value="">Cargando...</option>
                    ) : (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <input
                  type="text"
                  value={editingProduct.brand}
                  onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen</label>
                <input
                  type="file"
                  onChange={(e) => handleImageSelect(e.target.files?.[0])}
                  accept=".webp,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-red-800 file:text-white hover:file:bg-red-900"
                />
                {isCompressing && (
                  <p className="text-xs text-gray-500 mt-1">Comprimiendo imagen...</p>
                )}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">
                    {selectedImage && !isCompressing
                      ? `Nueva imagen (${(selectedImage.size / 1024).toFixed(0)} KB - WebP):`
                      : "Imagen actual:"}
                  </p>
                  <div className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={selectedImage ? URL.createObjectURL(selectedImage) : editingProduct?.urlImage}
                      alt="Vista previa"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                {uploadProgress > 0 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-800 h-2 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B0000] text-white text-sm rounded-md hover:bg-[#6A0000]"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className={`px-3 py-2 rounded-md text-sm ${currentPage === 0 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          Anterior
        </button>
        <span className="text-sm text-gray-700">Página {currentPage + 1} de {totalPages}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage >= totalPages - 1}
          className={`px-3 py-2 rounded-md text-sm ${currentPage >= totalPages - 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default AdminProducts;