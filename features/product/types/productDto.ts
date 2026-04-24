import { Brand } from "../../brand/types/brand";
import { Category } from "../../category/types/category";
import { BrandResponse } from "../../brand/types/brandDto";
import { CategoryResponse } from "../../category/types/categoryDto";

export interface ProductClientResponse {
  id: number;
  name: string;
  description: string;
  currentPrice?: number;
  petshopPrice?: number;
  veterinariaPrice?: number;
  forrajeriaPrice?: number;
  stock: number;
  category: Category;
  brand: Brand;
  urlImage: string;
  sku: string;
}

export interface ProductAdminResponse {
  id: number;
  name: string;
  description: string;
  petshopPrice: number;
  veterinariaPrice: number;
  forrajeriaPrice: number;
  stock: number;
  category: CategoryResponse;
  brand: BrandResponse;
  urlImage: string;
  sku: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  petshop_price: number;
  veterinaria_price: number;
  forrajeria_price: number;
  stock: number;
  category: string;
  brand: string;
  url_image: string;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  petshopPrice: number;
  veterinariaPrice: number;
  forrajeriaPrice: number;
  stock: number;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  urlImage: string;
}

export interface QuickBuyRequest {
  page?: number;
  size?: number;
  name?: string;
  brandsId?: number[];
  categoriesId?: number[];
  sku?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface QuickBuyProductResponse {
  id: number;
  name: string;
  sku: string;
  currentPrice?: number;
  petshopPrice?: number;
  veterinariaPrice?: number;
  forrajeriaPrice?: number;
  urlImage?: string;
  brand: Brand;
  category: CategoryResponse;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements?: number;
  totalPages: number;
  last: boolean;
}
