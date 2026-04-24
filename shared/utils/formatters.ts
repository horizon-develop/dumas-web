import { format, isValid } from "date-fns";

/**
 * Formats a date according to Argentine conventions
 * @param date The date to format
 * @param includeTime Whether to include time in the formatted output
 * @returns Formatted date string or fallback message if date is invalid
 */
export const formatDate = (date: Date | string | null | undefined, includeTime = false): string => {
  if (!date) return "Fecha no disponible";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!isValid(dateObj)) return "Fecha no disponible";

  const pattern = includeTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy";
  return format(dateObj, pattern);
};

/**
 * Formats a currency value according to Argentine peso conventions
 * @param amount The amount to format
 * @param decimals Number of decimal places (typically 2 in Argentina)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string | null | undefined, decimals = 2): string => {
  if (amount === null || amount === undefined) return "$0,00";

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return numAmount.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Returns the appropriate CSS class for an order status
 * @param status The order status
 * @returns CSS class string for the status
 */
export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case "COMPLETADO":
      return "bg-green-100 text-green-800";
    case "EN_PROCESO":
      return "bg-blue-100 text-blue-800";
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELADO":
      return "bg-red-100 text-red-800";
    case "ENVIADO":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Formats an order status for display in Spanish
 * @param status The order status
 * @returns Formatted status string in Spanish
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    "PENDIENTE": "pendiente",
    "EN_PROCESO": "en proceso",
    "COMPLETADO": "completado",
    "CANCELADO": "cancelado",
    "ENVIADO": "enviado"
  };

  return statusMap[status.toUpperCase()] || status.toLowerCase();
};

/**
 * Formats a phone number according to Argentine conventions
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber: string | null | undefined): string => {
  if (!phoneNumber) return "";

  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+54 9 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
  }

  return phoneNumber;
};

/**
 * Formats a postal code according to Argentine conventions
 * @param postalCode The postal code to format
 * @returns Formatted postal code string
 */
export const formatPostalCode = (postalCode: string | null | undefined): string => {
  if (!postalCode) return "";

  return postalCode.toUpperCase();
};

/**
 * Formats a complete address according to Argentine conventions
 * @param address Address components
 * @returns Formatted address string
 */
export const formatAddress = (address: {
  street?: string;
  streetNumber?: string;
  additionalInfo?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
}): string => {
  const { street, streetNumber, additionalInfo, postalCode, city, province } = address;

  if (!street || !streetNumber) return "Dirección no disponible";

  let formattedAddress = `${street} ${streetNumber}`;

  if (additionalInfo) {
    formattedAddress += `, ${additionalInfo}`;
  }

  if (city && postalCode) {
    formattedAddress += `\n${postalCode}, ${city}`;
  } else if (city) {
    formattedAddress += `\n${city}`;
  }

  if (province) {
    formattedAddress += `, ${province}`;
  }

  return formattedAddress;
}; 