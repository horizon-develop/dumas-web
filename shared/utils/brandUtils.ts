import { getAllCategoryAndSubcategoryIds, type CategoryWithParent } from "./categoryUtils";

/**
 * Base brand interface
 */
export interface BrandBase {
  id: number;
  name: string;
}

/**
 * Product with brand and category for filtering
 */
export interface ProductWithBrandAndCategory {
  brand: { id: number };
  category?: { id: number } | null;
}

/**
 * Filters brands based on selected categories.
 * Returns only brands that have products in the selected categories.
 * If no categories are selected, returns all brands.
 *
 * @param brands - All available brands
 * @param selectedCategoryIds - Array of selected category IDs
 * @param products - All products for cross-referencing
 * @param categories - All categories for hierarchy expansion
 * @param selectedBrandIds - Currently selected brand IDs (to preserve selection)
 * @returns Filtered list of brands
 */
export const filterBrandsByCategory = <T extends BrandBase>(
  brands: T[],
  selectedCategoryIds: number[],
  products: ProductWithBrandAndCategory[],
  categories: CategoryWithParent[],
  selectedBrandIds: number[] = []
): T[] => {
  if (!brands.length) return [];

  if (!selectedCategoryIds.length || !products.length || !categories.length) {
    return brands;
  }

  const categorySet = new Set<number>();
  selectedCategoryIds.forEach((catId) => {
    getAllCategoryAndSubcategoryIds(catId, categories).forEach((id) => categorySet.add(id));
  });

  const brandIds = new Set<number>();
  products.forEach((prod) => {
    if (prod.category && categorySet.has(prod.category.id)) {
      brandIds.add(prod.brand.id);
    }
  });

  const filtered = brands.filter((b) => brandIds.has(b.id));

  const selectedExtras = brands.filter(
    (b) => selectedBrandIds.includes(b.id) && !brandIds.has(b.id)
  );

  const result = [...filtered, ...selectedExtras];

  return result.length > 0 ? result : brands;
};
