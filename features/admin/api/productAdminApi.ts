import apiClient from "../../../shared/utils/axios";
import { convertBigDecimalToNumber } from "../../../shared/utils/numberUtils";
import type { ProductAdminResponse, CreateProductRequest, UpdateProductRequest } from "../../product/types/productDto";

export interface AdminProductPage {
  products: ProductAdminResponse[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export const fetchAdminProducts = async (
  page = 0,
  size = 16
): Promise<AdminProductPage> => {
  const response = await apiClient.get("/api/products/admin/paginated", {
    params: { page, size }
  });

  const data = response.data;
  const content = Array.isArray(data?.content) ? data.content : [];

  const products: ProductAdminResponse[] = content.map((product: ProductAdminResponse) => ({
    ...product,
    petshopPrice: convertBigDecimalToNumber(product.petshopPrice),
    veterinariaPrice: convertBigDecimalToNumber(product.veterinariaPrice),
    forrajeriaPrice: convertBigDecimalToNumber(product.forrajeriaPrice),
    stock: Number(product.stock) || 0
  }));

  return {
    products,
    page: Number(data?.number ?? page),
    size: Number(data?.size ?? size),
    totalPages: Number(data?.totalPages ?? 1),
    totalElements: Number(data?.totalElements ?? products.length)
  };
};

export const createProduct = async (product: CreateProductRequest): Promise<void> => {
  await apiClient.post("/api/products/create", product);
};

export const updateProduct = async (id: number, product: UpdateProductRequest): Promise<void> => {
  await apiClient.put(`/api/products/update/${id}`, product);
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/products/delete/${id}`);
};