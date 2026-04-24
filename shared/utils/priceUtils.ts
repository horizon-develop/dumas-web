import type { User } from "../../features/user/types/user";

/**
 * User profile types for price resolution
 */
export type UserProfile = "PETSHOP" | "VETERINARIA" | "FORRAJERIA";

/**
 * Product with price fields
 */
export interface ProductWithPrices {
  currentPrice?: number | null;
  petshopPrice?: number | null;
  veterinariaPrice?: number | null;
  forrajeriaPrice?: number | null;
}

/**
 * Resolves the correct price for a product based on the user's profile.
 * If currentPrice is already set and valid, it will be used.
 * Otherwise, the price is selected based on the user's profile type.
 *
 * @param product - The product with price fields
 * @param userProfile - The user's profile type (PETSHOP, VETERINARIA, FORRAJERIA)
 * @returns The resolved price for the product
 */
export const getPriceForProfile = (
  product: ProductWithPrices,
  userProfile?: UserProfile | string | null
): number => {
  if (product.currentPrice !== undefined && product.currentPrice !== null && product.currentPrice > 0) {
    return product.currentPrice;
  }

  const profile = userProfile || "PETSHOP";

  if (profile === "VETERINARIA") {
    return product.veterinariaPrice ?? product.petshopPrice ?? product.forrajeriaPrice ?? 0;
  }

  if (profile === "FORRAJERIA") {
    return product.forrajeriaPrice ?? product.petshopPrice ?? product.veterinariaPrice ?? 0;
  }

  return product.petshopPrice ?? product.veterinariaPrice ?? product.forrajeriaPrice ?? product.currentPrice ?? 0;
};

/**
 * Resolves the correct price for a product using the user data object.
 * Extracts the profile from user.clientDetails.profile.
 *
 * @param product - The product with price fields
 * @param user - The user data object (can be null)
 * @returns The resolved price for the product
 */
export const getPriceForUser = (
  product: ProductWithPrices,
  user: User | null
): number => {
  const profile = user?.clientDetails?.profile || "PETSHOP";
  return getPriceForProfile(product, profile);
};

/**
 * Calculates the discount percentage between original and discounted price.
 *
 * @param originalPrice - The original price
 * @param discountedPrice - The discounted price
 * @returns The discount percentage (0-100)
 */
export const calculateDiscountPercentage = (
  originalPrice: number,
  discountedPrice: number
): number => {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};
