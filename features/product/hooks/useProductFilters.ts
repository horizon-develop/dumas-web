import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getAllCategories } from "../../category/api/categoryApi";
import { getAllBrands } from "../../brand/api/brandApi";
import { CategoryResponse } from "../../category/types/categoryDto";
import { BrandResponse } from "../../brand/types/brandDto";

type BrandContext = "applied" | "temporary";

export interface UseProductFiltersReturn {
  categoryFilter: number | null;
  selectedBrands: number[];
  availableCategories: CategoryResponse[];
  allAvailableBrands: BrandResponse[];
  hasActiveFilters: boolean;
  
  tempCategoryFilter: number | null;
  tempSelectedBrands: number[];
  showMobileFilters: boolean;
  
  handleCategoryFilterChange: (categoryId: number) => void;
  handleBrandSelection: (brandId: number) => void;
  clearFilters: () => void;
  
  handleTempCategoryFilterChange: (categoryId: number) => void;
  handleTempBrandSelection: (brandId: number) => void;
  applyMobileFilters: () => void;
  clearTempFilters: () => void;
  openMobileFilters: () => void;
  closeMobileFilters: () => void;
  
  loading: boolean;
  error: string | null;
}

export const useProductFilters = (): UseProductFiltersReturn => {
  const location = useLocation();
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedBrandFromSection, setSelectedBrandFromSection] = useState<number | null>(null);
  
  const [tempCategoryFilter, setTempCategoryFilter] = useState<number | null>(null);
  const [tempSelectedBrands, setTempSelectedBrands] = useState<number[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [availableCategories, setAvailableCategories] = useState<CategoryResponse[]>([]);
  const [allAvailableBrands, setAllAvailableBrands] = useState<BrandResponse[]>([]);
  const [brandsCategoryFilter, setBrandsCategoryFilter] = useState<number | null>(null);
  const [brandsContext, setBrandsContext] = useState<BrandContext>("applied");
  const brandRequestRef = useRef(0);
  const categoryQueryAppliedRef = useRef(false);
  const [categoryFromQuery, setCategoryFromQuery] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const categories = await getAllCategories();
      setAvailableCategories(categories);
    } catch (err) {
      setError("Error al cargar categorías");
    }
  }, []);

  const loadBrands = useCallback(async (categoryId?: number | null, context: BrandContext = "applied", requestId?: number) => {
    try {
      const brands = await getAllBrands();
      if (requestId && requestId !== brandRequestRef.current) {
        return;
      }
      setAllAvailableBrands(brands);
      setBrandsCategoryFilter(categoryId ?? null);
      setBrandsContext(context);
    } catch (err) {
      setError("Error al cargar marcas");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryIdParam = params.get("categoryId");
    if (categoryIdParam) {
      const parsed = Number(categoryIdParam);
      if (!Number.isNaN(parsed)) {
        setCategoryFromQuery(parsed);
        categoryQueryAppliedRef.current = false;
        return;
      }
    }

    setCategoryFromQuery(null);
  }, [location.search]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadCategories();
      } catch (err) {
        setError("Error al cargar categorías");
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [loadCategories]);

  useEffect(() => {
    if (categoryFromQuery === null) {
      return;
    }

    if (categoryQueryAppliedRef.current && categoryFilter === categoryFromQuery) {
      return;
    }

    setCategoryFilter(categoryFromQuery);
    setTempCategoryFilter((prev) => (prev === null ? categoryFromQuery : prev));
    setSelectedBrandFromSection(null);
    categoryQueryAppliedRef.current = true;
  }, [categoryFromQuery, categoryFilter]);

  const brandCategoryTarget = showMobileFilters ? tempCategoryFilter : categoryFilter;
  const brandContextTarget: BrandContext = showMobileFilters ? "temporary" : "applied";

  useEffect(() => {
    const requestId = brandRequestRef.current + 1;
    brandRequestRef.current = requestId;
    loadBrands(brandCategoryTarget, brandContextTarget, requestId);
  }, [brandCategoryTarget, brandContextTarget, loadBrands]);

  useEffect(() => {
    if (selectedBrandFromSection) {
      setCategoryFilter(null);
      setSelectedBrands([selectedBrandFromSection]);
      setSelectedBrandFromSection(null);
    }
  }, [selectedBrandFromSection]);

  useEffect(() => {
    if (brandsContext !== "applied") return;
    if (categoryFilter === null) return;
    if (brandsCategoryFilter !== categoryFilter) return;

    setSelectedBrands(prev =>
      prev.filter(brandId => allAvailableBrands.some(brand => brand.id === brandId))
    );
  }, [brandsContext, categoryFilter, brandsCategoryFilter, allAvailableBrands]);

  useEffect(() => {
    if (brandsContext !== "temporary") return;
    if (!showMobileFilters) return;
    if (tempCategoryFilter === null) return;
    if (brandsCategoryFilter !== tempCategoryFilter) return;

    setTempSelectedBrands(prev =>
      prev.filter(brandId => allAvailableBrands.some(brand => brand.id === brandId))
    );
  }, [brandsContext, showMobileFilters, tempCategoryFilter, brandsCategoryFilter, allAvailableBrands]);

  useEffect(() => {
    if (showMobileFilters) {
      setTempCategoryFilter(categoryFilter);
      setTempSelectedBrands(selectedBrands);
    }
  }, [showMobileFilters, categoryFilter, selectedBrands]);

  const handleCategoryFilterChange = useCallback((categoryId: number) => {
    setCategoryFilter(prev => prev === categoryId ? null : categoryId);
    setSelectedBrandFromSection(null);
  }, []);

  const handleBrandSelection = useCallback((brandId: number) => {
    setSelectedBrands(prev =>
      prev.includes(brandId) ? prev.filter(b => b !== brandId) : [...prev, brandId]
    );
    setSelectedBrandFromSection(null);
  }, []);

  const clearFilters = useCallback(() => {
    setCategoryFilter(null);
    setSelectedBrands([]);
    setTempCategoryFilter(null);
    setTempSelectedBrands([]);
    setSelectedBrandFromSection(null);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  }, []);

  const handleTempCategoryFilterChange = useCallback((categoryId: number) => {
    setTempCategoryFilter(prev => prev === categoryId ? null : categoryId);
  }, []);

  const handleTempBrandSelection = useCallback((brandId: number) => {
    setTempSelectedBrands(prev =>
      prev.includes(brandId) ? prev.filter(b => b !== brandId) : [...prev, brandId]
    );
  }, []);

  const applyMobileFilters = useCallback(() => {
    setCategoryFilter(tempCategoryFilter);
    setSelectedBrands(tempSelectedBrands);
    setShowMobileFilters(false);
    setSelectedBrandFromSection(null);
  }, [tempCategoryFilter, tempSelectedBrands]);

  const clearTempFilters = useCallback(() => {
    setTempCategoryFilter(null);
    setTempSelectedBrands([]);
  }, []);

  const openMobileFilters = useCallback(() => {
    setShowMobileFilters(true);
  }, []);

  const closeMobileFilters = useCallback(() => {
    setShowMobileFilters(false);
  }, []);

  const hasActiveFilters = categoryFilter !== null || selectedBrands.length > 0;

  return {
    categoryFilter,
    selectedBrands,
    availableCategories,
    allAvailableBrands,
    hasActiveFilters,
    
    tempCategoryFilter,
    tempSelectedBrands,
    showMobileFilters,
    
    handleCategoryFilterChange,
    handleBrandSelection,
    clearFilters,
    
    handleTempCategoryFilterChange,
    handleTempBrandSelection,
    applyMobileFilters,
    clearTempFilters,
    openMobileFilters,
    closeMobileFilters,
    
    loading,
    error,
  };
};
