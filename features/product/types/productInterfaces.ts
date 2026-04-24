import type { Brand } from "../../brand/types/brand";
import type { Category } from "../../category/types/category";
import type { QuickBuyProductResponse } from "./productDto";

/**
 * Product card interface for admin product management
 */
export interface ProductCard {
  id: number;
  name: string;
  description: string;
  petshopPrice: number;
  veterinariaPrice: number;
  forrajeriaPrice: number;
  stock: number;
  category: Category;
  brand: Brand;
  urlImage: string;
}

/**
 * Editable product interface for admin forms
 */
export interface EditableProduct {
  id: number;
  name: string;
  description: string;
  petshopPrice: number;
  veterinariaPrice: number;
  forrajeriaPrice: number;
  stock: number;
  category: string;
  brand: string;
  urlImage: string;
}

/**
 * Selected product interface for quick cart operations
 * Extends QuickBuyProductResponse with selection state
 */
export interface SelectedProduct extends QuickBuyProductResponse {
  quantity: number | null;
  selected: boolean;
}
