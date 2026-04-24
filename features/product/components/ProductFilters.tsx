import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { FiX, FiCheck, FiFilter, FiChevronDown } from "react-icons/fi";
import { useProductFilters } from "../providers/ProductFiltersProvider";
import { BrandSearchFilter } from "../../../shared/components/BrandSearchFilter";
import { buildCategoryHierarchy, type CategoryHierarchy } from "../../../shared/utils/categoryUtils";

export const ProductFilters: React.FC = () => {
  const filtersContext = useProductFilters();
  
  if (!filtersContext) {
    return null;
  }
  
  const {
    categoryFilter,
    selectedBrands,
    availableCategories,
    filteredCategories,
    filteredCategoriesCount,
    availableBrands,
    availableBrandsCount,
    allAvailableBrands,
    getBrandsForCategory,
    hasActiveFilters,
    tempCategoryFilter,
    tempSelectedBrands,
    showMobileFilters,
    handleCategoryFilterChange,
    handleBrandSelection,
    handleTempCategoryFilterChange,
    handleTempBrandSelection,
    applyMobileFilters,
    clearFilters,
    clearTempFilters,
    closeMobileFilters,
    openMobileFilters,
  } = filtersContext;

  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [expandedCategoriesMobile, setExpandedCategoriesMobile] = useState<Set<number>>(new Set());
  const [brandListMaxHeight, setBrandListMaxHeight] = useState<number | null>(null);
  const [mobileBrandMaxHeight, setMobileBrandMaxHeight] = useState<number | null>(null);
  const [isCatalogEmpty, setIsCatalogEmpty] = useState<boolean>(false);
  const desktopCardRef = useRef<HTMLDivElement | null>(null);
  const desktopHeaderRef = useRef<HTMLDivElement | null>(null);
  const desktopCategoriesRef = useRef<HTMLDivElement | null>(null);
  const [quickCartOpen, setQuickCartOpen] = useState(false);

  const categoryHierarchy = useMemo((): CategoryHierarchy[] => {
    const categoriesToShow = selectedBrands.length > 0 ? filteredCategories : availableCategories;
    return buildCategoryHierarchy(categoriesToShow);
  }, [availableCategories, filteredCategories, selectedBrands.length]);

  const getBrandsForUI = useCallback((isMobile: boolean) => {
    if (isMobile && getBrandsForCategory) {
      return getBrandsForCategory(tempCategoryFilter);
    }
    return availableBrands;
  }, [availableBrands, getBrandsForCategory, tempCategoryFilter]);

  const getSelectedBrandNames = useCallback((isMobile: boolean) => {
    const selectedBrandIds = isMobile ? tempSelectedBrands : selectedBrands;
    const source = getBrandsForUI(isMobile);
    const names = source
      .filter(brand => selectedBrandIds.includes(brand.id))
      .map(brand => brand.name);

    if (names.length === selectedBrandIds.length) return names;

    const missingIds = selectedBrandIds.filter(id => !source.some(b => b.id === id));
    const fallback = allAvailableBrands
      .filter(brand => missingIds.includes(brand.id))
      .map(brand => brand.name);

    return [...names, ...fallback];
  }, [selectedBrands, tempSelectedBrands, getBrandsForUI, allAvailableBrands]);

  const handleBrandToggleFromFilter = useCallback((brandName: string, isMobile: boolean) => {
    const source = getBrandsForUI(isMobile);
    const brand = source.find(b => b.name === brandName) || allAvailableBrands.find(b => b.name === brandName);
    if (brand) {
      if (isMobile) {
        handleTempBrandSelection(brand.id);
      } else {
        handleBrandSelection(brand.id);
      }
    }
  }, [allAvailableBrands, handleBrandSelection, handleTempBrandSelection, getBrandsForUI]);

  const toggleCategoryExpansion = useCallback((categoryId: number, isMobile = false) => {
    const setExpanded = isMobile ? setExpandedCategoriesMobile : setExpandedCategories;
    
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const mobileBrands = useMemo(() => getBrandsForUI(true), [getBrandsForUI]);
  const desktopBrands = useMemo(() => getBrandsForUI(false), [getBrandsForUI]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeBrandHeight = () => {
      const card = desktopCardRef.current;
      if (!card) return;

      const productGrid = document.querySelector('[data-products-grid]') as HTMLElement | null;
      const productPage = document.querySelector('[data-product-page]') as HTMLElement | null;
      const topPagination = document.querySelector('[data-top-pagination]') as HTMLElement | null;
      const bottomPagination = document.querySelector('[data-bottom-pagination]') as HTMLElement | null;
      const catalogEmptyFlag = productPage?.getAttribute('data-has-products') === 'false';
      setIsCatalogEmpty(catalogEmptyFlag);
      const cardStyles = window.getComputedStyle(card);
      const rowGap = parseInt(cardStyles.rowGap || '0', 10) || 0;
      const paddingTop = parseInt(cardStyles.paddingTop || '0', 10) || 0;
      const paddingBottom = parseInt(cardStyles.paddingBottom || '0', 10) || 0;

      const headerHeight = desktopHeaderRef.current?.getBoundingClientRect().height ?? 0;
      const categoriesHeight = desktopCategoriesRef.current?.getBoundingClientRect().height ?? 0;
      const gridHeight = productGrid?.getBoundingClientRect().height ?? 0;
      const topPagHeight = topPagination?.getBoundingClientRect().height ?? 0;
      const bottomPagHeight = bottomPagination?.getBoundingClientRect().height ?? 0;
      const cardHeight = card.getBoundingClientRect().height;

      const fallbackHeight = Math.max(window.innerHeight - 200, 260);
      const contentHeight = gridHeight + topPagHeight + bottomPagHeight + 24;
      const productLimit = Math.max(contentHeight, fallbackHeight);
      const rawBaseline = catalogEmptyFlag
        ? fallbackHeight
        : Math.max(contentHeight, fallbackHeight, cardHeight);
      const baseline = Math.min(Math.max(rawBaseline, fallbackHeight), productLimit);

      const available = baseline - headerHeight - categoriesHeight - paddingTop - paddingBottom - rowGap * 2;
      const targetHeight = Math.max(220, Math.min(available, productLimit));

      setBrandListMaxHeight(Number.isFinite(targetHeight) ? targetHeight : fallbackHeight);

      const mobileMaxViewport = Math.max(260, window.innerHeight * 0.9);
      const mobileHeight = Math.min(targetHeight, mobileMaxViewport);
      setMobileBrandMaxHeight(Number.isFinite(mobileHeight) ? mobileHeight : mobileMaxViewport);
    };

    const observers: ResizeObserver[] = [];

    const productGrid = document.querySelector('[data-products-grid]') as HTMLElement | null;
    const productPage = document.querySelector('[data-product-page]') as HTMLElement | null;

    if (productGrid && typeof ResizeObserver !== 'undefined') {
      const productObserver = new ResizeObserver(computeBrandHeight);
      productObserver.observe(productGrid);
      observers.push(productObserver);
    }

    if (productPage && typeof ResizeObserver !== 'undefined') {
      const productObserver = new ResizeObserver(computeBrandHeight);
      productObserver.observe(productPage);
      observers.push(productObserver);
    }

    if (desktopCardRef.current && typeof ResizeObserver !== 'undefined') {
      const cardObserver = new ResizeObserver(computeBrandHeight);
      cardObserver.observe(desktopCardRef.current);
      observers.push(cardObserver);
    }

    window.addEventListener('resize', computeBrandHeight);
    computeBrandHeight();

    return () => {
      window.removeEventListener('resize', computeBrandHeight);
      observers.forEach(observer => observer.disconnect());
    };
  }, [availableBrandsCount, availableCategories.length]);

  useEffect(() => {
    const handleQuickCartOpen = () => {
      setQuickCartOpen(true);
      closeMobileFilters();
    };
    const handleQuickCartClose = () => setQuickCartOpen(false);
    window.addEventListener("quickcart-open", handleQuickCartOpen);
    window.addEventListener("quickcart-close", handleQuickCartClose);
    return () => {
      window.removeEventListener("quickcart-open", handleQuickCartOpen);
      window.removeEventListener("quickcart-close", handleQuickCartClose);
    };
  }, [closeMobileFilters]);

  const CategoryTree: React.FC<{ 
    categories: CategoryHierarchy[], 
    level?: number, 
    isMobile?: boolean 
  }> = React.memo(({ categories, level = 0, isMobile = false }) => {
    const expandedSet = isMobile ? expandedCategoriesMobile : expandedCategories;
    const currentFilter = isMobile ? tempCategoryFilter : categoryFilter;
    const handleChange = isMobile ? handleTempCategoryFilterChange : handleCategoryFilterChange;

    return (
      <div className={level > 0 ? 'ml-2 md:ml-3 pl-2 md:pl-3 border-l-2 border-gray-100' : ''}>
        {categories.map((category) => (
          <div key={category.id} className="group">
            <div className="flex items-center justify-between py-1.5 md:py-2 hover:bg-gray-50/80 rounded-lg transition-all duration-200">
              <button
                onClick={() => handleChange(category.id)}
                className="flex items-center flex-1 cursor-pointer px-2 md:px-3 text-left min-w-0"
              >
                <span className={`text-xs md:text-sm transition-colors duration-200 truncate ${
                  currentFilter === category.id 
                    ? 'text-[#8B0000] font-bold' 
                    : 'text-gray-700 group-hover:text-gray-900'
                } ${level === 0 ? 'font-semibold' : ''}`}>
                  {category.name}
                  {category.children.length > 0 && (
                    <span className="ml-1 md:ml-2 text-xs bg-gray-100 text-gray-600 px-1 md:px-2 py-0.5 rounded-full whitespace-nowrap">
                      {category.children.length}
                    </span>
                  )}
                </span>
              </button>
              
              {category.children.length > 0 && (
                <button
                  onClick={() => toggleCategoryExpansion(category.id, isMobile)}
                  className="p-1 md:p-2 text-gray-400 hover:text-[#8B0000] hover:bg-[#8B0000]/5 rounded-lg transition-all duration-200 mr-1 md:mr-2 flex-shrink-0"
                  title={expandedSet.has(category.id) ? 'Colapsar' : 'Expandir'}
                >
                  <div className={`transform transition-transform duration-200 ${
                    expandedSet.has(category.id) ? 'rotate-180' : ''
                  }`}>
                    <FiChevronDown size={14} className="md:w-4 md:h-4" />
                  </div>
                </button>
              )}
            </div>
            
            {category.children.length > 0 && (
              <div className={`overflow-hidden transition-all duration-300 ease-out ${
                expandedSet.has(category.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <CategoryTree 
                  categories={category.children} 
                  level={level + 1} 
                  isMobile={isMobile}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  });

  const MobileFilters = () => (
    <>
      {/* Botón flotante */}
      {!quickCartOpen && (
        <button
          onClick={openMobileFilters}
          className="lg:hidden fixed bottom-20 md:bottom-24 right-4 md:right-6 z-30 bg-gradient-to-r from-[#8B0000] to-[#6A0000] text-white p-3 md:p-4 rounded-2xl shadow-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <FiFilter size={20} className="md:w-6 md:h-6" />
          {hasActiveFilters && (
            <div className="absolute -top-1.5 md:-top-2 -right-1.5 md:-right-2 bg-white text-[#8B0000] w-5 h-5 md:w-6 md:h-6 rounded-full text-xs font-bold border-2 border-[#8B0000] flex items-center justify-center animate-pulse">
              {selectedBrands.length + (categoryFilter !== null ? 1 : 0)}
            </div>
          )}
        </button>
      )}

      {/* Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end justify-center p-2 md:p-0">
          <div className="w-full max-w-sm md:max-w-md bg-white rounded-t-2xl md:rounded-t-3xl shadow-2xl transform animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-2xl md:rounded-t-3xl border-b border-gray-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Filtros</h2>
                {hasActiveFilters && (
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    {selectedBrands.length + (categoryFilter !== null ? 1 : 0)} filtros activos
                  </p>
                )}
              </div>
              <button
                onClick={closeMobileFilters}
                className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <FiX size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Categorías */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Categorías
            </h3>
            {isCatalogEmpty && (
              <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                Catálogo vacío. Selecciona filtros y aplica cuando haya resultados.
              </div>
            )}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl md:rounded-2xl p-2 md:p-3 shadow-sm">
              <CategoryTree categories={categoryHierarchy} isMobile={true} />
            </div>
          </div>

              {/* Marcas - USANDO EL NUEVO COMPONENTE */}
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  Marcas
                  <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs font-bold ml-2">{mobileBrands.length}</span>
                </h3>
                <div className="bg-gray-50/70 border border-gray-100 rounded-xl md:rounded-2xl p-2 md:p-3 shadow-sm">
                  <BrandSearchFilter
                    brands={mobileBrands.map(brand => brand.name)}
                    selectedBrands={getSelectedBrandNames(true)}
                    onBrandToggle={(brandName) => handleBrandToggleFromFilter(brandName, true)}
                    placeholder="Buscar marcas..."
                    inputId="brand-search-mobile"
                    inputName="brand-search-mobile"
                    maxHeight="max-h-full"
                    maxHeightPx={mobileBrandMaxHeight ?? undefined}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 md:p-4 flex gap-2 md:gap-3 rounded-b-2xl md:rounded-b-3xl">
              <button
                onClick={clearTempFilters}
                className="flex-1 py-2.5 md:py-3 px-3 md:px-4 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <FiX size={16} className="md:w-[18px] md:h-[18px]" />
                Limpiar
              </button>
              <button
                onClick={applyMobileFilters}
                className="flex-1 py-2.5 md:py-3 px-3 md:px-4 bg-gradient-to-r from-[#8B0000] to-[#6A0000] text-white rounded-lg md:rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <FiCheck size={16} className="md:w-[18px] md:h-[18px]" />
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const DesktopFilters = () => (
    <div className="hidden lg:block w-full max-w-xs xl:max-w-sm flex-shrink-0 h-full flex flex-col self-stretch min-h-0">
      <div
        ref={desktopCardRef}
        className="bg-white/95 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col gap-8 p-8 h-full"
      >
        {/* Header */}
        <div ref={desktopHeaderRef} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8B0000] via-[#DC2626] to-[#7F1D1D] shadow-lg shadow-red-100" />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B0000]/75">Panel de filtros</span>
              <span className="font-black text-2xl leading-tight bg-gradient-to-r from-[#8B0000] via-[#DC2626] to-[#7F1D1D] text-transparent bg-clip-text drop-shadow-sm">Filtrar catálogo</span>
            </div>
          </div>
          {isCatalogEmpty && (
            <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg">
              Catálogo vacío en este momento. Configura filtros y aplica cuando haya resultados.
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {hasActiveFilters && (
              <>
                <span className="text-[#8B0000] text-sm font-semibold bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                  {selectedBrands.length + (categoryFilter !== null ? 1 : 0)} filtros activos
                </span>
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold bg-white text-[#8B0000] border border-red-100 hover:border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  Limpiar todo
                </button>
              </>
            )}
            {!hasActiveFilters && (
              <span className="text-xs text-gray-500">Activa categorías o marcas para acotar el catálogo.</span>
            )}
          </div>
        </div>

        {/* Categorías */}
        <div ref={desktopCategoriesRef} className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[#8B0000]">
            <span className="font-bold text-lg flex items-center">Categorías <span className="ml-2 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-bold">{selectedBrands.length > 0 ? filteredCategoriesCount : availableCategories.length}</span></span>
            <span className="text-xs text-gray-500">Explora por secciones</span>
          </div>
          <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100 shadow-sm">
            <CategoryTree categories={categoryHierarchy} />
          </div>
        </div>

        {/* Marcas */}
        <div className="flex flex-col gap-3 flex-1 min-h-[280px]">
          <div className="flex items-center justify-between text-[#8B0000]">
            <span className="font-bold text-lg flex items-center">Marcas <span className="ml-2 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-bold">{availableBrandsCount}</span></span>
            {selectedBrands.length > 0 && (
              <span className="text-xs text-gray-500">{selectedBrands.length} seleccionada{selectedBrands.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          {isCatalogEmpty && (
            <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              No hay productos listados. Las marcas se ajustarán cuando apliques filtros.
            </div>
          )}
          <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100 shadow-sm h-full flex flex-col min-h-0">
            <BrandSearchFilter
              brands={desktopBrands.map(brand => brand.name)}
              selectedBrands={getSelectedBrandNames(false)}
              onBrandToggle={(brandName) => handleBrandToggleFromFilter(brandName, false)}
              placeholder="Buscar marcas..."
              inputId="brand-search-desktop"
              inputName="brand-search-desktop"
              className="flex flex-col flex-1 min-h-0"
              listClassName="flex-1"
              maxHeight="max-h-full"
              maxHeightPx={brandListMaxHeight ?? undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileFilters />
      <DesktopFilters />
      
      {/* Estilos CSS */}
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
        
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        @media (max-width: 768px) {
          .truncate {
            max-width: 180px;
          }
        }
      `}</style>
    </>
  );
};
