import React, { useState, useEffect, useMemo } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { SearchInput } from "./SearchInput";

interface BrandSearchFilterProps {
  brands: string[];
  selectedBrands: string[];
  onBrandToggle: (brand: string) => void;
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  listClassName?: string;
  maxHeightPx?: number;
  inputId?: string;
  inputName?: string;
}

export const BrandSearchFilter: React.FC<BrandSearchFilterProps> = ({
  brands,
  selectedBrands,
  onBrandToggle,
  placeholder = "Buscar marcas...",
  className = "",
  maxHeight = "max-h-60",
  listClassName = "",
  maxHeightPx,
  inputId,
  inputName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const filteredBrands = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return brands;
    }

    const normalizedSearch = debouncedSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    return brands.filter((brand: string) => {
      const normalizedBrand = brand.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedBrand.includes(normalizedSearch);
    });
  }, [brands, debouncedSearch]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <SearchInput
        placeholder={placeholder}
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={handleClearSearch}
        inputId={inputId}
        inputName={inputName}
        size="sm"
      />

      {searchTerm && isSearching && (
        <div className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Buscando...
        </div>
      )}

      <div
        className={`${maxHeight} overflow-y-auto custom-scrollbar ${listClassName}`}
        style={maxHeightPx ? { maxHeight: maxHeightPx } : undefined}
      >
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 gap-0.5 md:gap-1">
            {filteredBrands.map((brand: string, index: number) => (
              <label
                key={`${brand}-${index}`}
                className="group flex items-center p-2 md:p-2.5 rounded-lg hover:bg-gray-50/80 transition-all duration-200 cursor-pointer"
              >
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => onBrandToggle(brand)}
                    className="sr-only peer"
                  />
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-gray-300 rounded peer-checked:border-[#8B0000] peer-checked:bg-[#8B0000] transition-all duration-200">
                    <FiCheck 
                      size={10} 
                      className="md:w-3 md:h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                    />
                  </div>
                </div>
                <span className={`ml-2 md:ml-3 text-xs md:text-sm transition-colors duration-200 truncate ${
                  selectedBrands.includes(brand) 
                    ? 'text-[#8B0000] font-medium' 
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {brand}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <FiSearch size={20} className="md:w-6 md:h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs md:text-sm">
              {searchTerm ? 'No se encontraron marcas' : 'No hay marcas disponibles'}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="text-xs md:text-sm text-[#8B0000] hover:underline mt-1"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>

      {debouncedSearch && filteredBrands.length > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          {filteredBrands.length} marca{filteredBrands.length !== 1 ? 's' : ''} encontrada{filteredBrands.length !== 1 ? 's' : ''}
          <button
            onClick={handleClearSearch}
            className="ml-2 text-[#8B0000] hover:underline"
          >
            Ver todas
          </button>
        </div>
      )}

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};
