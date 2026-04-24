import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, ArrowLeft, Filter } from 'lucide-react';
import { fetchQuickBuyProducts } from '../../../product/api/productApi';
import { getAllBrands } from '../../../brand/api/brandApi';
import { getAllCategories } from '../../../category/api/categoryApi';
import { BrandResponse } from '../../../brand/types/brandDto';
import { CategoryResponse } from '../../../category/types/categoryDto';
import { QuickBuyProductResponse } from '../../../product/types/productDto';
import { SelectedProduct } from '../../../product/types/productInterfaces';
import ProductTable from './ProductTable';
import Pagination from './Pagination';
import FiltersSection from './FiltersSection';
import { useCart } from '../../context/CartContext';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import { isAuthenticated } from '../../../auth/utils/authUtils';
import { expandCategoryIds } from '../../../../shared/utils/categoryUtils';
import { filterBrandsByCategory } from '../../../../shared/utils/brandUtils';
import { getErrorMessage } from '../../../../shared/types/apiError';

interface QuickCartModalProps {
  onClose: () => void;
}

const QuickCartModal: React.FC<QuickCartModalProps> = React.memo(({ onClose }) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [products, setProducts] = useState<SelectedProduct[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [brandsSelected, setBrandsSelected] = useState<number[]>([]);
  const [categoriesSelected, setCategoriesSelected] = useState<number[]>([]);
  const [sku, setSku] = useState('');
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [allQuickProducts, setAllQuickProducts] = useState<QuickBuyProductResponse[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showBulkQuantityModal, setShowBulkQuantityModal] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState<string>("");
  const [bulkQuantityError, setBulkQuantityError] = useState<string | null>(null);
  const [authRedirecting, setAuthRedirecting] = useState(false);
  const authEventDispatched = useRef(false);
  const { addItem } = useCart();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const { overflow } = document.body.style;
    const { overflow: htmlOverflow } = document.documentElement.style;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, []);

  useEffect(() => {
    const handleLoggedIn = () => setShowAuthPrompt(false);
    window.addEventListener("auth-login", handleLoggedIn);
    return () => window.removeEventListener("auth-login", handleLoggedIn);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      setShowAuthPrompt(true);
    }
    authEventDispatched.current = false;
    setAuthRedirecting(false);

    window.dispatchEvent(new Event("quickcart-open"));
    return () => {
      window.dispatchEvent(new Event("quickcart-close"));
    };
  }, []);

  useEffect(() => {
    if (showAuthPrompt) {
      authEventDispatched.current = false;
      setAuthRedirecting(false);
    }
  }, [showAuthPrompt]);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedBrands = useDebounce(brandsSelected, 300);
  const debouncedCategories = useDebounce(categoriesSelected, 300);
  const debouncedSku = useDebounce(sku, 300);

  const selectedCount = useMemo(() => 
    products.filter(p => p.selected).length, 
    [products]
  );

  const totalSelectedValue = useMemo(() =>
    products
      .filter(p => p.selected)
      .reduce((sum, p) => sum + ((p.currentPrice || 0) * (p.quantity ?? 0)), 0),
    [products]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count += 1;
    if (sku) count += 1;
    count += brandsSelected.length + categoriesSelected.length;
    return count;
  }, [search, sku, brandsSelected.length, categoriesSelected.length]);

  const expandedCategories = useMemo(() => {
    if (!debouncedCategories.length) return [];
    return expandCategoryIds(debouncedCategories, categories);
  }, [debouncedCategories, categories]);

  const derivedBrands = useMemo(() => {
    return filterBrandsByCategory(
      brands,
      categoriesSelected,
      allQuickProducts,
      categories,
      brandsSelected
    );
  }, [brands, categoriesSelected, allQuickProducts, categories, brandsSelected]);

  const hasFilters = useMemo(() =>
    Boolean(search || brandsSelected.length > 0 || categoriesSelected.length > 0 || sku),
    [search, brandsSelected.length, categoriesSelected.length, sku]
  );

  useEffect(() => {
    const loadBrands = async () => {
      setLoadingBrands(true);
      try {
        const brandsData = await getAllBrands();
        setBrands(brandsData);
      } catch (error) {
        toast.error(getErrorMessage(error), {
          position: "top-right",
          duration: 4000,
        });
      } finally {
        setLoadingBrands(false);
      }
    };

    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        toast.error(getErrorMessage(error), {
          position: "top-right",
          duration: 4000,
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    loadBrands();
    loadCategories();
  }, []);

  useEffect(() => {
    const loadAllQuickProducts = async () => {
      try {
        const data = await fetchQuickBuyProducts({
          page: 0,
          size: 800,
        });
        setAllQuickProducts(data.content || []);
      } catch (error) {
        setAllQuickProducts([]);
      }
    };

    loadAllQuickProducts();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchQuickBuyProducts({
          page,
          size: 10,
          name: debouncedSearch || undefined,
          brandsId: debouncedBrands.length > 0 ? debouncedBrands : undefined,
          categoriesId: expandedCategories.length > 0 ? expandedCategories : undefined,
          sku: debouncedSku || undefined,
        });
        
        const enriched = data.content.map((p: QuickBuyProductResponse) => ({ 
          ...p, 
          quantity: null, 
          selected: false 
        }));
        setProducts(enriched);
        setTotalPages(data.totalPages);
        setLast(data.last);
      } catch (error) {
        toast.error(getErrorMessage(error), {
          position: "top-right",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [debouncedSearch, debouncedBrands, expandedCategories, debouncedSku, page]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, debouncedBrands, debouncedCategories, debouncedSku]);

  const toggleBrand = useCallback((id: number) => {
    setBrandsSelected(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  }, []);

  const toggleCategory = useCallback((id: number) => {
    setCategoriesSelected(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }, []);

  const handleSelect = useCallback((id: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const allSelected = products.every(p => p.selected);
    setProducts(prev => prev.map(p => ({ ...p, selected: !allSelected })));
  }, [products]);

  const handleQuantityChange = useCallback((id: number, qty: number | null) => {
    if (qty !== null && qty < 0) qty = 0;
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, quantity: qty } : p))
    );
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (page > 0) {
      setPage(page - 1);
    }
  }, [page]);

  const handleNextPage = useCallback(() => {
    if (!last) {
      setPage(page + 1);
    }
  }, [last]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setBrandsSelected([]);
    setCategoriesSelected([]);
    setSku('');
    setPage(0);
  }, []);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose, isClosing]);

  const handleClearBrands = useCallback(() => {
    setBrandsSelected([]);
  }, []);

  const handleClearCategories = useCallback(() => {
    setCategoriesSelected([]);
  }, []);

  const handleOpenBulkQuantity = useCallback(() => {
    if (!products.some(p => p.selected)) {
      toast("Selecciona productos antes de asignar cantidades", {
        position: "top-right",
        duration: 2500,
        icon: "ℹ️",
      });
      return;
    }
    setBulkQuantity("");
    setBulkQuantityError(null);
    setShowBulkQuantityModal(true);
  }, [products]);


  const handleAddSelectedToCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setShowAuthPrompt(true);
      return;
    }

    const selectedWithQty = products.filter(p => p.selected && (p.quantity ?? 0) > 0);
    const hasSelectedWithoutQty = products.some(p => p.selected && (p.quantity ?? 0) <= 0);
    const hasSelection = products.some(p => p.selected);

    if (!hasSelection) {
      toast("No seleccionaste productos", {
        position: "top-right",
        duration: 2500,
        icon: "ℹ️",
      });
      return;
    }

    if (hasSelectedWithoutQty || selectedWithQty.length === 0) {
      setShowBulkQuantityModal(true);
      return;
    }

    setAddingToCart(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const p of selectedWithQty) {
        try {
          await addItem(
            {
              productId: p.id,
              productName: p.name,
              urlImage: (p as any)?.urlImage,
              unitPrice: p.currentPrice || 0,
              subtotal: (p.currentPrice || 0) * (p.quantity ?? 0),
            },
            p.quantity ?? 1
          );
          successCount++;
        } catch (error: any) {
          if (error?.message === "AUTH_REQUIRED") {
            setShowAuthPrompt(true);
            throw error;
          }
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} producto${successCount > 1 ? 's' : ''} agregado${successCount > 1 ? 's' : ''} al carrito`, {
          position: "top-right",
          duration: 3000,
        });
        setProducts(prev => prev.map(p => ({ ...p, selected: false })));
        window.dispatchEvent(new Event("cart-update"));

        setTimeout(() => {
          setIsClosing(true);
          setTimeout(() => {
            onClose();
            navigate('/carrito');
          }, 300);
        }, 2000);
      }

      if (errorCount > 0) {
        toast.error(`Error al agregar ${errorCount} producto${errorCount > 1 ? 's' : ''}`, {
          position: "top-right",
          duration: 3500,
        });
      }

    } catch (error) {
      toast.error(getErrorMessage(error), {
        position: "top-right",
        duration: 3500,
      });
    } finally {
      setAddingToCart(false);
    }
  }, [products, onClose, navigate]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-[200] p-2 sm:p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-xl sm:rounded-2xl border border-gray-200 w-full max-w-screen-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-transform duration-300 ${isClosing ? 'scale-95' : 'scale-100'}`}
      >
        
        <div className="flex flex-wrap gap-3 justify-between items-start sm:items-center p-3 sm:p-5 border-b bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <h2 className="text-lg sm:text-2xl font-bold">Pedido rápido</h2>
            {(loadingBrands || loadingCategories) && (
              <div className="ml-2 sm:ml-3 text-xs sm:text-sm text-white/80 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cargando opciones...
              </div>
            )}
          </div>
          <button 
            onClick={handleClose} 
            className="text-white hover:text-gray-200 transition-colors p-1"
            aria-label="Cerrar modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col sm:flex-row sm:divide-x sm:divide-gray-200">
          {/* Filtros desktop en columna izquierda */}
          <div className="hidden sm:flex sm:flex-col sm:w-[300px] lg:w-[340px] xl:w-[360px] min-w-[260px] max-w-[380px] bg-gray-50 border-r border-gray-200 overflow-y-auto p-3 sm:p-4 gap-3">
            <div className="text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <FiltersSection
              search={search}
              sku={sku}
              brandsSelected={brandsSelected}
              categoriesSelected={categoriesSelected}
              brands={derivedBrands}
              categories={categories}
              loadingBrands={loadingBrands}
              loadingCategories={loadingCategories}
              selectedCount={selectedCount}
              totalSelectedValue={totalSelectedValue}
              hasFilters={hasFilters}
              onSearchChange={setSearch}
              onSkuChange={setSku}
              onToggleBrand={toggleBrand}
              onToggleCategory={toggleCategory}
              onClearFilters={clearFilters}
              onClearBrands={handleClearBrands}
              onClearCategories={handleClearCategories}
            />
          </div>

          {/* CTA móvil para filtros */}
          <div className="sm:hidden px-3 pb-1.5 mt-1.5">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="w-full inline-flex items-center justify-between px-3 py-2 bg-white text-[#c8102e] rounded-lg font-semibold shadow-sm hover:shadow-md transition-all border border-[#c8102e]/60"
            >
              <span className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                Filtrar productos
              </span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-white text-[#c8102e] text-[11px] font-bold rounded-full shadow-sm">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Tabla productos */}
          <div className="flex-1 min-h-0 overflow-auto p-2 sm:p-4 bg-white">
            <ProductTable
              products={products}
              loading={loading}
              hasFilters={hasFilters}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onQuantityChange={handleQuantityChange}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          isLast={last}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />

        <div className="p-2 sm:p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center space-y-1.5 sm:space-y-0 sm:space-x-3">
          <div className="text-xs sm:text-sm text-gray-600">
            {selectedCount > 0 ? (
              <>
                {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''} • 
                <span className="font-semibold text-red-600 ml-1">
                  Total: ${totalSelectedValue.toLocaleString()}
                </span>
              </>
            ) : (
              'Selecciona productos para agregar al carrito'
            )}
          </div>
          
          <div className="flex w-full sm:w-auto justify-end space-x-2 sm:space-x-3 flex-wrap">
            <button
              onClick={handleOpenBulkQuantity}
              className="px-3 py-1.5 bg-white text-[#c8102e] border border-[#c8102e] rounded-md hover:bg-[#c8102e]/5 transition-colors flex-1 sm:flex-none min-w-[120px] text-center text-xs sm:text-sm font-semibold"
            >
              Asignar cantidad a seleccionados
            </button>
            <button
              onClick={handleAddSelectedToCart}
              disabled={selectedCount === 0 || addingToCart}
              className="px-3 py-1.5 bg-[#c8102e] text-white rounded-md hover:bg-[#a30d25] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 flex-1 sm:flex-none min-w-[120px] text-xs sm:text-sm shadow"
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>Agregar al Carrito ({selectedCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center p-2">
          <div className="bg-white w-full max-w-md h-full rounded-xl shadow-2xl overflow-hidden animate__animated animate__fadeInDown flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 sticky top-0 z-10">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-red-700 font-semibold"
                aria-label="Cerrar filtros"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Volver</span>
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Filtros activos: {activeFiltersCount}</span>
                <button
                  onClick={() => {
                    clearFilters();
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  aria-label="Limpiar filtros"
                >
                  Limpiar
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-3">Ajusta los filtros y luego aplica para ver resultados.</p>
              <FiltersSection
                search={search}
                sku={sku}
                brandsSelected={brandsSelected}
                categoriesSelected={categoriesSelected}
                brands={derivedBrands}
                categories={categories}
                loadingBrands={loadingBrands}
                loadingCategories={loadingCategories}
                selectedCount={selectedCount}
                totalSelectedValue={totalSelectedValue}
                hasFilters={hasFilters}
                onSearchChange={setSearch}
                onSkuChange={setSku}
                onToggleBrand={toggleBrand}
                onToggleCategory={toggleCategory}
                onClearFilters={clearFilters}
                onClearBrands={handleClearBrands}
                onClearCategories={handleClearCategories}
              />
            </div>
            <div className="p-4 border-t bg-white">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthPrompt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowAuthPrompt(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold">!</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Inicia sesión para continuar</h3>
            </div>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Necesitas iniciar sesión para agregar productos desde el pedido rápido. Te llevamos al panel de acceso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className={`flex-1 px-4 py-3 rounded-xl bg-[#8B0000] text-white font-semibold shadow hover:bg-[#6A0000] transition-colors ${authRedirecting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={authRedirecting}
                onClick={() => {
                  if (authRedirecting || authEventDispatched.current) return;
                  setAuthRedirecting(true);
                  setShowAuthPrompt(false);
                  handleClose();
                  setTimeout(() => {
                    if (authEventDispatched.current) return;
                    authEventDispatched.current = true;
                    window.dispatchEvent(new Event("auth-open-login"));
                  }, 320);
                }}
              >
                Ir a iniciar sesión
              </button>
              <button
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                onClick={() => setShowAuthPrompt(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkQuantityModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowBulkQuantityModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold">⚠️</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Define una cantidad</h3>
            </div>
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              Asigna la misma cantidad para todos los productos seleccionados y vuelve a agregar al carrito.
            </p>
            <div className="space-y-2 mb-4">
              <label className="text-sm font-semibold text-gray-700" htmlFor="bulkQuantity">Cantidad</label>
              <input
                id="bulkQuantity"
                type="number"
                min={1}
                placeholder="0"
                value={bulkQuantity}
                onChange={(e) => {
                  setBulkQuantity(e.target.value);
                  setBulkQuantityError(null);
                }}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {bulkQuantityError && <p className="text-sm text-red-600">{bulkQuantityError}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 px-4 py-3 rounded-xl bg-[#8B0000] text-white font-semibold shadow hover:bg-[#6A0000] transition-colors"
                onClick={() => {
                  const qty = Number(bulkQuantity);
                  if (!qty || qty <= 0) {
                    setBulkQuantityError("Ingresa una cantidad mayor a 0");
                    return;
                  }
                  setProducts(prev => prev.map(p => p.selected ? { ...p, quantity: qty } : p));
                  setShowBulkQuantityModal(false);
                }}
              >
                Aplicar a seleccionados
              </button>
              <button
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                onClick={() => setShowBulkQuantityModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

QuickCartModal.displayName = 'QuickCartModal';

export default QuickCartModal;
