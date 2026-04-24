import { Brand } from "../../brand/types/brand";
import { Category } from "../../category/types/category";

export interface Product {
  id: number;
  name: string;
  description: string;
  petshopPrice?: number;
  veterinariaPrice?: number;
  forrajeriaPrice?: number;
  currentPrice?: number;
  stock: number;
  category: Category;
  brand: Brand;
  urlImage: string;
  sku: string;
}
