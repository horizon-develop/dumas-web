import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getAllCategories, getCategoriesByBrand } from "../../category/api/categoryApi";
import { getAllBrands, getBrandsByCategory } from "../../brand/api/brandApi";
import { CategoryResponse } from "../../category/types/categoryDto";
import { BrandResponse } from "../../brand/types/brandDto";

interface ProductFiltersContextType {
  availableBrands: BrandResponse[];
  availableBrandsCount: number;
  filteredCategories: CategoryResponse[];
  filteredCategoriesCount: number;
  categoryAndSubcategoryIds: number[];
  getBrandsForCategory: (categoryId: number | null) => BrandResponse[];
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

const ProductFiltersContext = createContext<ProductFiltersContextType | undefined>(undefined);

export const ProductFiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [availableBrands, setAvailableBrands] = useState<BrandResponse[]>([]);
  const [availableBrandsCount, setAvailableBrandsCount] = useState(0);
  const [filteredCategories, setFilteredCategories] = useState<CategoryResponse[]>([]);
  const [filteredCategoriesCount, setFilteredCategoriesCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedBrandFromSection, setSelectedBrandFromSection] = useState<number | null>(null);

  const [tempCategoryFilter, setTempCategoryFilter] = useState<number | null>(null);
  const [tempSelectedBrands, setTempSelectedBrands] = useState<number[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [availableCategories, setAvailableCategories] = useState<CategoryResponse[]>([]);
  const [allAvailableBrands, setAllAvailableBrands] = useState<BrandResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAllCategoryAndSubcategoryIds = useCallback((categoryId: number): number[] => {
    const result: number[] = [];
    const visit = (catId: number) => {
      result.push(catId);
      availableCategories.forEach(cat => {
        if (cat.parent && cat.parent.id === catId) {
          visit(cat.id);
        }
      });
    };
    visit(categoryId);
    return result;
  }, [availableCategories]);

  const getBrandsForCategory = useCallback((categoryId: number | null): BrandResponse[] => {
    if (categoryId === null) {
      return allAvailableBrands;
    }
    return availableBrands;
  }, [allAvailableBrands, availableBrands]);

  useEffect(() => {
    const fetchBrandsForCategory = async () => {
      if (categoryFilter === null) {
        if (allAvailableBrands.length > 0) {
          setAvailableBrands(allAvailableBrands);
          setAvailableBrandsCount(allAvailableBrands.length);
        }
        return;
      }
      try {
        const brands = await getBrandsByCategory(categoryFilter);
        setAvailableBrands(brands);
        setAvailableBrandsCount(brands.length);
      } catch (err) {
        setAvailableBrands([]);
        setAvailableBrandsCount(0);
      }
    };
    fetchBrandsForCategory();
  }, [categoryFilter, allAvailableBrands.length]);

  useEffect(() => {
    const fetchCategoriesForBrand = async () => {
      if (selectedBrands.length === 0) {
        if (availableCategories.length > 0) {
          setFilteredCategories(availableCategories);
          setFilteredCategoriesCount(availableCategories.length);
        }
        return;
      }
      if (selectedBrands.length === 1) {
        try {
          const categories = await getCategoriesByBrand(selectedBrands[0]);
          setFilteredCategories(categories);
          setFilteredCategoriesCount(categories.length);
        } catch (err) {
          setFilteredCategories([]);
          setFilteredCategoriesCount(0);
        }
      } else {
        setFilteredCategories(availableCategories);
        setFilteredCategoriesCount(availableCategories.length);
      }
    };
    fetchCategoriesForBrand();
  }, [selectedBrands, availableCategories.length]);

  const loadCategories = useCallback(async () => {
    try {
      const categories = await getAllCategories();
      setAvailableCategories(categories);
    } catch (err) {
      setError("Error al cargar categorías");
    }
  }, []);

  const loadBrands = useCallback(async () => {
    try {
      const brands = await getAllBrands();
      setAllAvailableBrands(brands);
    } catch (err) {
      setError("Error al cargar marcas");
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadCategories(), loadBrands()]);
      } catch (err) {
        setError("Error al cargar datos iniciales");
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [loadCategories, loadBrands]);


  useEffect(() => {
    if (location.pathname === "/shop" && location.state && location.state.categoryId) {
      setCategoryFilter(location.state.categoryId);
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    if (selectedBrandFromSection) {
      setCategoryFilter(null);
      setSelectedBrands([selectedBrandFromSection]);
      setSelectedBrandFromSection(null);
    }
  }, [selectedBrandFromSection]);

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

  const categoryAndSubcategoryIds = useMemo(() => {
    return categoryFilter !== null ? getAllCategoryAndSubcategoryIds(categoryFilter) : [];
  }, [categoryFilter, getAllCategoryAndSubcategoryIds]);

  const value: ProductFiltersContextType = {
    availableBrands,
    availableBrandsCount,
    filteredCategories,
    filteredCategoriesCount,
    categoryFilter,
    selectedBrands,
    availableCategories,
    allAvailableBrands,
    hasActiveFilters,
    categoryAndSubcategoryIds,
    getBrandsForCategory,

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

  return (
    <ProductFiltersContext.Provider value={value}>
      {children}
    </ProductFiltersContext.Provider>
  );
};

export const useProductFilters = (): ProductFiltersContextType | null => {
  const context = useContext(ProductFiltersContext);
  return context ?? null;
};
