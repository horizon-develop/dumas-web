import axiosInstance from "../../../shared/utils/axios";

import { StructuredCategoryPage } from "../../category/types/category";
import { Product } from "../types/product";
import { PaginatedResponse, ProductClientResponse, QuickBuyRequest, QuickBuyProductResponse } from "../types/productDto";

export const getPaginatedProducts = async (
  page: number = 0,
  size: number = 16,
  filters?: {
    categoriesId: number[];
    brandsId: number[];
  }
): Promise<PaginatedResponse<ProductClientResponse>> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (filters?.categoriesId && filters.categoriesId.length > 0) {
      filters.categoriesId.forEach(categoryId => 
        params.append('categoriesId', categoryId.toString())
      );
    }
    

    if (filters?.brandsId && filters.brandsId.length > 0) {
      filters.brandsId.forEach(brandId => 
        params.append('brandsId', brandId.toString())
      );
    }

    const response = await axiosInstance.get(`/api/products/paginated`, { params });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message
      || error.message
      || "Error en el servidor";
    throw new Error(message);
  }
};

export const getGroupedProducts = async (
  page: number = 0,
  size: number = 4
): Promise<StructuredCategoryPage> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await axiosInstance.get<StructuredCategoryPage>(`/api/products/grouped?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message
      || error.message
      || "Error en el servidor";
    throw new Error(message);
  }
};

export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Error desconocido");
  }
};

export const fetchQuickBuyProducts = async (request: QuickBuyRequest): Promise<PaginatedResponse<QuickBuyProductResponse>> => {
  try {
    const params = new URLSearchParams();
    
    if (request.page !== undefined) {
      params.append('page', request.page.toString());
    }
    if (request.size !== undefined) {
      params.append('size', request.size.toString());
    }
    if (request.name) {
      params.append('name', request.name);
    }
    if (request.sku) {
      params.append('sku', request.sku);
    }
    if (request.sortBy) {
      params.append('sortBy', request.sortBy);
    }
    if (request.sortDirection) {
      params.append('sortDirection', request.sortDirection);
    }
    
    if (request.brandsId && request.brandsId.length > 0) {
      request.brandsId.forEach(id => {
        params.append('brandsId', id.toString());
      });
    }
    
    if (request.categoriesId && request.categoriesId.length > 0) {
      request.categoriesId.forEach(id => {
        params.append('categoriesId', id.toString());
      });
    }
    
    const queryString = params.toString();
    const url = `/api/products/quick-buy${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get<PaginatedResponse<QuickBuyProductResponse>>(url);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Error al obtener productos para compra rápida");
  }
};