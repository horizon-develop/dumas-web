export interface CreateAddressRequest {
    fullName: string;
    country: string;
    province: string;
    city: string;
    postalCode?: string | null;
    street: string;
    streetNumber: string;
    additionalInfo?: string | null;
    label?: string | null;
}

export interface AddressResponse {
    id: number;
    fullName: string;
    country: string;
    province: string;
    city: string;
    postalCode?: string | null;
    street: string;
    streetNumber?: string | null;
    additionalInfo?: string | null;
    isDefault?: boolean;
    label?: string | null;
}
