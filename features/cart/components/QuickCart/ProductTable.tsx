import React from 'react';
import { Package } from 'lucide-react';
import { SelectedProduct } from '../../../product/types/productInterfaces';

interface ProductTableProps {
  products: SelectedProduct[];
  loading: boolean;
  hasFilters: boolean;
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  onQuantityChange: (id: number, qty: number | null) => void;
  onClearFilters: () => void;
}

const ProductTable: React.FC<ProductTableProps> = React.memo(({
  products,
  loading,
  hasFilters,
  onSelect,
  onSelectAll,
  onQuantityChange,
  onClearFilters
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-600">Cargando productos...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No se encontraron productos</p>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="mt-4 text-red-600 hover:text-red-700 font-medium"
          >
            Limpiar filtros para ver todos los productos
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm text-sm">
        <thead className="bg-gray-100 text-xs sm:text-sm">
          <tr>
            <th className="p-2 sm:p-3 border text-left w-10 sm:w-12">
              <input 
                type="checkbox" 
                checked={products.length > 0 && products.every(p => p.selected)}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </th>
            <th className="p-2 sm:p-3 border text-left hidden sm:table-cell font-semibold text-gray-700">SKU</th>
            <th className="p-2 sm:p-3 border text-left font-semibold text-gray-700">Nombre</th>
            <th className="p-2 sm:p-3 border text-left hidden md:table-cell font-semibold text-gray-700">Marca</th>
            <th className="p-2 sm:p-3 border text-left hidden md:table-cell font-semibold text-gray-700">Categoría</th>
            <th className="p-2 sm:p-3 border text-left hidden sm:table-cell font-semibold text-gray-700">Precio</th>
            <th className="p-2 sm:p-3 border text-left font-semibold text-gray-700">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="hover:bg-red-50 transition-colors">
              <td className="p-2 sm:p-3 border text-center">
                <input 
                  type="checkbox" 
                  checked={p.selected} 
                  onChange={() => onSelect(p.id)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </td>
              <td className="p-2 sm:p-3 border hidden sm:table-cell text-xs sm:text-sm text-gray-600">{p.sku || 'N/A'}</td>
              <td className="p-2 sm:p-3 border font-medium text-gray-900">{p.name || 'Sin nombre'}</td>
              <td className="p-2 sm:p-3 border hidden md:table-cell text-gray-700">{p.brand?.name || 'N/A'}</td>
              <td className="p-2 sm:p-3 border hidden md:table-cell text-gray-700">{p.category?.name || 'N/A'}</td>
              <td className="p-2 sm:p-3 border hidden sm:table-cell font-semibold text-green-600">
                ${p.currentPrice?.toLocaleString() || '0'}
              </td>
              <td className="p-2 sm:p-3 border">
                <input
                  type="number"
                  min="0"
                  value={p.quantity ?? ''}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '') {
                      onQuantityChange(p.id, null);
                      return;
                    }
                    const parsed = Number(value);
                    const nextQty = Number.isNaN(parsed) ? null : Math.max(0, parsed);
                    onQuantityChange(p.id, nextQty);
                  }}
                  className="w-14 sm:w-20 border border-gray-300 px-2 py-1 text-xs sm:text-sm rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

ProductTable.displayName = 'ProductTable';

export default ProductTable;
