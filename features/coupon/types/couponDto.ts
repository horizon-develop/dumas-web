import { Profile } from "../../user/types/profile";
import { DiscountType } from "./discountType";

export interface CouponResponse {
  id: number;
  code: string;
  discountType: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  applicableProfiles: Profile[];
  active: boolean;
}

export interface CreateCouponRequest {
  code: string;
  discountType: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface UpdateCouponRequest {
  code: string;
  discountType: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
}