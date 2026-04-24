import { Product } from "../../product/types/product";


export interface Brand {
    id: number;
    name: string;
    parent: Brand;
}

export interface BrandGroup {
    brand: Brand;
    products: Product[];
  }