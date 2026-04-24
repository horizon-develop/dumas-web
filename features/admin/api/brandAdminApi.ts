import apiClient from "../../../shared/utils/axios";
import { BrandResponse } from "../../brand/types/brandDto";

export interface BrandRequest {
  name: string;
}

export const getAllBrandsAdmin = async (): Promise<BrandResponse[]> => {
  try {
    const response = await apiClient.get<BrandResponse[]>("/api/brands");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Error al obtener marcas";
    throw new Error(message);
  }
};

export const createBrand = async (brand: BrandRequest): Promise<BrandResponse> => {
  try {
    const response = await apiClient.post<BrandResponse>("/api/brands/create", brand);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Error al crear marca";
    throw new Error(message);
  }
};

export const updateBrand = async (id: number, brand: BrandRequest): Promise<BrandResponse> => {
  try {
    const response = await apiClient.put<BrandResponse>(`/api/brands/update/${id}`, brand);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Error al actualizar marca";
    throw new Error(message);
  }
};

export const deleteBrand = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/brands/delete/${id}`);
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Error al eliminar marca";
    throw new Error(message);
  }
};
