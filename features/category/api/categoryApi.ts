
import axiosInstance from "../../../shared/utils/axios";
import { CategoryResponse } from "../types/categoryDto";

export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  try {
    const response = await axiosInstance.get<CategoryResponse[]>("/api/categories");

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message
      || error.message
      || "Error en el servidor";
    throw new Error(message);
  }
};

export const getCategoriesByBrand = async (brandId: number): Promise<CategoryResponse[]> => {
  try {
    const response = await axiosInstance.get<CategoryResponse[]>(`/api/categories/by-brand/${brandId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message
      || error.message
      || "Error en el servidor";
    throw new Error(message);
  }
};