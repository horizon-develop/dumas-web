import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getPaginatedProducts } from "../api/productApi";
import { isAuthenticated, getUserData } from "../../auth/utils/authUtils";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { useProductFilters } from "../providers/ProductFiltersProvider";
import { ProductClientResponse } from "../types/productDto";
import { getPriceForUser } from "../../../shared/utils/priceUtils";

interface ProductsListProps {
  plainBackground?: boolean;
}

const ProductsList: React.FC<ProductsListProps> = ({ plainBackground = false }) => {
  const location = useLocation();
  
  const filtersContext = useProductFilters();
  const isShopPage = location.pathname === "/shop";
  const categoryAndSubcategoryIds = filtersContext?.categoryAndSubcategoryIds ?? [];
  const selectedBrands = filtersContext?.selectedBrands ?? [];
  const clearFilters = useMemo(() => filtersContext?.clearFilters ?? (() => {}), [filtersContext?.clearFilters]);
  
  const [products, setProducts] = useState<ProductClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 16;

  const user = useMemo(() => getUserData(), []);
  const isUserAuthenticated = useMemo(() => isAuthenticated(), []);

  const resolvePrice = useCallback((p: ProductClientResponse): number => {
    return getPriceForUser(p, user);
  }, [user]);

  const loadPaginatedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const categoriesId: number[] = categoryAndSubcategoryIds;
      const brandsId: number[] = selectedBrands;
      const data = await getPaginatedProducts(currentPage, pageSize, { 
        categoriesId,
        brandsId
      });
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalElements ?? data.content.length);

      const mapped = data.content.map((p) => ({
        ...p,
        currentPrice: resolvePrice(p),
      }));
      setProducts(mapped);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos paginados.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, categoryAndSubcategoryIds, selectedBrands, resolvePrice]);

  useEffect(() => {
    if (isShopPage && filtersContext) {
      setCurrentPage(0);
    }
  }, [categoryAndSubcategoryIds, selectedBrands, isShopPage, filtersContext]);

  useEffect(() => {
    if (!error) {
      loadPaginatedProducts();
    }
  }, [loadPaginatedProducts, error]);

  useEffect(() => {
    if (isShopPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isShopPage]);


  const generatePaginationControls = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;
    const half = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(0, currentPage - half);
    let endPage = Math.min(totalPages - 1, currentPage + half);

    if (currentPage <= half) endPage = Math.min(maxVisiblePages - 1, totalPages - 1);
    if (currentPage >= totalPages - 1 - half) startPage = Math.max(0, totalPages - maxVisiblePages);

    if (totalPages <= 0) return null;

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          disabled={loading}
          className={`min-w-[40px] px-3 py-2 rounded-xl transition-all text-base font-semibold shadow-md border-2 ${
            currentPage === i
              ? "bg-gradient-to-r from-red-400 via-red-600 to-red-700 text-white border-red-500 scale-105"
              : "bg-white text-red-700 border-gray-200 hover:bg-red-50 hover:border-red-400 disabled:opacity-50"
          }`}
          style={{ transition: 'transform 0.2s' }}
        >
          {i + 1}
        </button>
      );
    }
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center animate-fade-in">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0 || loading}
          className="p-2 rounded-full bg-white border border-gray-200 text-red-700 hover:bg-red-50 hover:border-red-400 shadow disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <FiChevronLeft size={22} />
        </button>
        <div className="flex gap-2 mx-2">{pages}</div>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1 || loading}
          className="p-2 rounded-full bg-white border border-gray-200 text-red-700 hover:bg-red-50 hover:border-red-400 shadow disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <FiChevronRight size={22} />
        </button>
      </div>
    );
  };

  if (loading && !products.length) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white via-red-50 to-gray-100 pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-400 border-t-transparent shadow-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-br from-white via-red-50 to-gray-100 pt-20">
        <div className="mb-4 text-red-400 animate-bounce">
          <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-2xl font-bold text-red-700 mb-2">¡Ups! Algo salió mal.</p>
        <p className="text-gray-600 mb-6 text-lg">{error}</p>
        <button
          onClick={() => {
             setError(null);
             setLoading(true);
             loadPaginatedProducts();
          }}
          className="px-8 py-3 bg-gradient-to-r from-red-400 via-red-600 to-red-700 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const hasActiveFilters = categoryAndSubcategoryIds.length > 0 || selectedBrands.length > 0;

  const containerClasses = plainBackground
    ? "flex flex-col lg:flex-row w-full pt-10 pb-14 gap-6"
    : "flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-white via-red-50 to-gray-100 pt-20 pb-24 gap-6";

  return (
    <div className={containerClasses}>
      {/* Filtros a la izquierda, sticky y con fondo blanco/rojo */}
      {location.pathname === "/shop" && (
        <aside className="hidden lg:block w-[320px] min-w-[280px] max-w-[340px] px-2 py-4 bg-white rounded-2xl shadow-xl border border-red-100 mr-8 animate-fade-in">
          <ProductFilters />
        </aside>
      )}
      {location.pathname === "/shop" && (
        <div className="lg:hidden">
          <ProductFilters />
        </div>
      )}
      {/* Contenido principal: productos y paginado */}
      <main
        className="flex-1 min-w-0 max-w-7xl mx-auto w-full px-2 md:px-4 flex flex-col self-stretch gap-4"
        data-product-page
        data-has-products={products.length > 0}
      >
        {isShopPage && (
          <div className="bg-gradient-to-r from-red-50 via-white to-red-100 border border-red-100 rounded-2xl shadow-lg p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
            <div>
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-1">Catálogo mayorista</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Encuentra lo que tu petshop necesita</h1>
              <p className="text-gray-700 mt-2 text-sm md:text-base max-w-2xl">
                Explora productos seleccionados por veterinarios, precios mayoristas y entregas rápidas. Usa los filtros para afinar tu búsqueda o regístrate para desbloquear beneficios.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isUserAuthenticated && (
                <Link
                  to="/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 transition-colors text-left"
                >
                  ¿Ya hiciste tu pedido? Revisa su estado
                </Link>
              )}
              {!isUserAuthenticated && (
                <Link
                  to="/registro"
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-700 font-semibold bg-white shadow-sm hover:border-red-400 hover:text-red-800 transition-colors"
                >
                  Ingresa ahora y obtene más beneficios
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Paginado y contador arriba, separado y con fondo blanco, no sticky */}
        <div
          className="bg-white p-4 rounded-2xl shadow-xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in"
          data-top-pagination
        >
          <div className="order-2 sm:order-1">
            {totalPages > 1 && generatePaginationControls()}
          </div>
          <div className="text-sm md:text-base text-gray-700 order-3 whitespace-nowrap font-semibold">
            {products.length > 0 && `Mostrando ${Math.min((currentPage * pageSize) + 1, totalItems)} - ${Math.min((currentPage + 1) * pageSize, totalItems)} de ${totalItems} productos`}
          </div>
        </div>

        {/* Listado de productos y paginado inferior */}
        <div className="flex-1 pb-12" style={{ minHeight: '100%' }}>
          {products.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100 text-center mt-6 animate-fade-in">
              <div className="text-2xl text-red-500 mb-4">😞 No se encontraron productos</div>
              {hasActiveFilters ? (
                <>
                  <p className="text-gray-700 mb-6 text-base">Intenta ajustar los filtros o limpiarlos para ver más resultados.</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 via-red-700 to-red-800 text-white rounded-xl hover:bg-red-700 transition-all text-base font-semibold shadow-lg"
                  >
                    Limpiar filtros
                  </button>
                </>
              ) : (
                <p className="text-gray-700 mb-6 text-base">No hay productos disponibles en este momento.</p>
              )}
            </div>
              ) : (
                <>
                  <div
                    id="productos"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in"
                    data-products-grid
                  >
                {products.slice(0, pageSize).map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    isAuthenticated={isUserAuthenticated} 
                    userProfile={user?.clientDetails?.profile} 
                  />
                ))}
              </div>
              {/* Paginado inferior para accesibilidad */}
              {totalPages > 1 && (
                <div
                  className="mt-10 bg-white p-4 rounded-2xl shadow-xl border border-red-100 flex justify-center animate-fade-in"
                  data-bottom-pagination
                >
                  {generatePaginationControls()}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductsList;
