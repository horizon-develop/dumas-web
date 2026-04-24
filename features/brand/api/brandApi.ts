
import axiosInstance from "../../../shared/utils/axios";
import { BrandResponse } from "../types/brandDto";

export const getAllBrands = async (): Promise<BrandResponse[]> => {
  try {
    const response = await axiosInstance.get<BrandResponse[]>("/api/brands");

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message
      || error.message
      || "Error en el servidor";
    throw new Error(message);
  }
};

export const getBrandsByCategory = async (categoryId: number): Promise<BrandResponse[]> => {
  try {
    const response = await axiosInstance.get<BrandResponse[]>(`/api/brands/by-category/${categoryId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message
      || error.message
      || "Error en el servidor";
    throw new Error(message);
  }
};