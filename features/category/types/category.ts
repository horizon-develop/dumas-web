import { BrandGroup } from "../../brand/types/brand";

export interface Category {
    id: number;
    name: string;
    parent: Category;
}

export interface CategoryGroup {
    category: Category;
    brands: BrandGroup[];
}

export interface StructuredCategoryPage {
    content: CategoryGroup[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  }