import { User } from "../../user/types/user";

export interface Address {
    id?: number;
    user?: User;
    fullName?: string;
    country?: string;
    province?: string;
    city?: string;
    postalCode?: string | null;
    street?: string;
    streetNumber?: string | null;
    additionalInfo?: string | null;
    label?: string | null;
}