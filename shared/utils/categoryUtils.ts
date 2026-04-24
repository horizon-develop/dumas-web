/**
 * Category hierarchy interface for building tree structures
 */
export interface CategoryHierarchy {
  id: number;
  name: string;
  children: CategoryHierarchy[];
  parent?: { id: number; name: string };
}

/**
 * Base category interface with parent relationship
 */
export interface CategoryWithParent {
  id: number;
  name: string;
  parent?: { id: number; name: string } | null;
}

/**
 * Builds a hierarchical tree structure from a flat list of categories.
 * Categories with no parent become root nodes, children are nested appropriately.
 *
 * @param categories - Flat list of categories with parent references
 * @returns Array of root categories with nested children
 */
export const buildCategoryHierarchy = (categories: CategoryWithParent[]): CategoryHierarchy[] => {
  if (!categories.length) return [];

  const categoryMap = new Map<number, CategoryHierarchy>();
  const roots: CategoryHierarchy[] = [];

  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      children: [],
      parent: cat.parent ? { id: cat.parent.id, name: cat.parent.name } : undefined,
    });
  });

  categoryMap.forEach((category) => {
    const originalCategory = categories.find((c) => c.id === category.id);

    if (originalCategory?.parent) {
      const parentCategory = categoryMap.get(originalCategory.parent.id);
      if (parentCategory) {
        parentCategory.children.push(category);
      }
    } else {
      roots.push(category);
    }
  });

  return roots;
};

/**
 * Gets all category IDs including all descendants (subcategories).
 * Useful for filtering products by a category and all its subcategories.
 *
 * @param categoryId - The starting category ID
 * @param categories - Flat list of all categories
 * @returns Array of category IDs including the starting category and all descendants
 */
export const getAllCategoryAndSubcategoryIds = (
  categoryId: number,
  categories: CategoryWithParent[]
): number[] => {
  const result: number[] = [];

  const visit = (catId: number) => {
    result.push(catId);
    categories.forEach((cat) => {
      if (cat.parent && cat.parent.id === catId) {
        visit(cat.id);
      }
    });
  };

  visit(categoryId);
  return result;
};

/**
 * Expands an array of category IDs to include all their subcategories.
 *
 * @param categoryIds - Array of category IDs to expand
 * @param categories - Flat list of all categories
 * @returns Array with all original IDs plus all subcategory IDs
 */
export const expandCategoryIds = (
  categoryIds: number[],
  categories: CategoryWithParent[]
): number[] => {
  if (!categoryIds.length) return [];

  const ids = new Set<number>();
  categoryIds.forEach((catId) => {
    getAllCategoryAndSubcategoryIds(catId, categories).forEach((id) => ids.add(id));
  });

  return Array.from(ids);
};

/**
 * Gets the full path of a category from root to the specified category.
 *
 * @param categoryId - The category ID
 * @param categories - Flat list of all categories
 * @returns Array of category names from root to the specified category
 */
export const getCategoryPath = (
  categoryId: number,
  categories: CategoryWithParent[]
): string[] => {
  const path: string[] = [];
  let current = categories.find((c) => c.id === categoryId);

  while (current) {
    path.unshift(current.name);
    if (current.parent) {
      current = categories.find((c) => c.id === current!.parent!.id);
    } else {
      break;
    }
  }

  return path;
};
