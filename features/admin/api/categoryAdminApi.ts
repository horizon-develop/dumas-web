import apiClient from "../../../shared/utils/axios";
import { CategoryResponse } from "../../category/types/categoryDto";

export interface CategoryRequest {
  name: string;
}

export const getAllCategoriesAdmin = async (): Promise<CategoryResponse[]> => {
  try {
    const response = await apiClient.get<CategoryResponse[]>("/api/categories");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Error al obtener categorías";
    throw new Error(message);
  }
};

export const createCategory = async (category: CategoryRequest): Promise<CategoryResponse> => {
  try {
    const response = await apiClient.post<CategoryResponse>("/api/categories/create", category);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Error al crear categoría";
    throw new Error(message);
  }
};

export const updateCategory = async (id: number, category: CategoryRequest): Promise<CategoryResponse> => {
  try {
    const response = await apiClient.put<CategoryResponse>(`/api/categories/update/${id}`, category);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Error al actualizar categoría";
    throw new Error(message);
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/categories/delete/${id}`);
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Error al eliminar categoría";
    throw new Error(message);
  }
};
