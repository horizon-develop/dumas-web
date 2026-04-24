import React, { useMemo, useState } from 'react';
import { Search, Package, Filter, X, ChevronDown } from 'lucide-react';
import FilterDropdown from './FilterDropdown';
import { BrandResponse } from '../../../brand/types/brandDto';
import { CategoryResponse } from '../../../category/types/categoryDto';
import { BrandSearchFilter } from '../../../../shared/components/BrandSearchFilter';

interface FiltersSectionProps {
  search: string;
  sku: string;
  brandsSelected: number[];
  categoriesSelected: number[];
  brands: BrandResponse[];
  categories: CategoryResponse[];
  loadingBrands: boolean;
  loadingCategories: boolean;
  selectedCount: number;
  totalSelectedValue: number;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onSkuChange: (value: string) => void;
  onToggleBrand: (id: number) => void;
  onToggleCategory: (id: number) => void;
  onClearFilters: () => void;
  onClearBrands: () => void;
  onClearCategories: () => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = React.memo(({
  search,
  sku,
  brandsSelected,
  categoriesSelected,
  brands,
  categories,
  loadingCategories,
  selectedCount,
  totalSelectedValue,
  hasFilters,
  onSearchChange,
  onSkuChange,
  onToggleBrand,
  onToggleCategory,
  onClearFilters,
  onClearBrands,
  onClearCategories
}) => {
  const [brandsOpen, setBrandsOpen] = useState(false);

  const brandNames = useMemo(() => {
    const names = brands.map(b => b.name);
    return names.slice().sort((a, b) => a.localeCompare(b, 'es'));
  }, [brands]);

  const selectedBrandNames = useMemo(() => {
    return brands
      .filter(b => brandsSelected.includes(b.id))
      .map(b => b.name);
  }, [brands, brandsSelected]);

  const handleBrandToggleByName = (brandName: string) => {
    const brand = brands.find(b => b.name === brandName);
    if (brand) {
      onToggleBrand(brand.id);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white rounded-xl shadow border border-gray-100 flex flex-col gap-4">
      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <span className="font-semibold text-sm text-gray-800">Nombre</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-300 h-4 w-4 z-10" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all text-sm bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-800">Categorías</span>
            <span className="ml-2 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-[11px] font-bold">{categories.length}</span>
          </div>
          <FilterDropdown
            label="Categorías"
            options={categories}
            selectedIds={categoriesSelected}
            onToggle={onToggleCategory}
            placeholder="Seleccionar categorías..."
            icon={<Filter className="h-4 w-4" />}
            loading={loadingCategories}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-800">Marcas</span>
            <span className="ml-2 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-[11px] font-bold">{brands.length}</span>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setBrandsOpen(prev => !prev)}
              className="w-full px-3 py-2 flex items-center justify-between text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <Package className="h-4 w-4 text-red-500" />
                Marcas disponibles
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${brandsOpen ? 'rotate-180' : ''}`} />
            </button>
            {brandsOpen && (
              <div className="px-3 pb-3 pt-1 bg-white">
                <BrandSearchFilter
                  brands={brandNames}
                  selectedBrands={selectedBrandNames}
                  onBrandToggle={handleBrandToggleByName}
                  placeholder="Buscar marca..."
                  maxHeightPx={200}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-semibold text-sm text-gray-800">SKU</span>
          <input
            type="text"
            placeholder="Filtrar por SKU..."
            value={sku}
            onChange={(e) => onSkuChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all text-sm bg-white"
          />
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 mt-1 sm:mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-xs sm:text-sm font-semibold bg-red-50 px-3 py-1 rounded-lg shadow-sm"
            >
              <Filter className="h-5 w-5" />
              <span>Limpiar filtros</span>
            </button>
            <div className="flex flex-wrap gap-2">
              {brandsSelected.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] sm:text-xs bg-gradient-to-r from-red-100 via-white to-gray-100 text-red-700 font-semibold shadow">
                  {brandsSelected.length} marca{brandsSelected.length > 1 ? 's' : ''} seleccionada{brandsSelected.length > 1 ? 's' : ''}
                  <button
                    onClick={onClearBrands}
                    className="ml-2 hover:text-red-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {categoriesSelected.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm bg-gradient-to-r from-red-100 via-white to-gray-100 text-red-700 font-semibold shadow">
                  {categoriesSelected.length} categoría{categoriesSelected.length > 1 ? 's' : ''} seleccionada{categoriesSelected.length > 1 ? 's' : ''}
                  <button
                    onClick={onClearCategories}
                    className="ml-2 hover:text-red-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
          </div>
          {selectedCount > 0 && (
            <div className="text-xs sm:text-sm text-gray-700 font-medium">
              {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''} • 
              <span className="font-bold text-red-600 ml-2">
                ${totalSelectedValue.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

FiltersSection.displayName = 'FiltersSection';

export default FiltersSection;
