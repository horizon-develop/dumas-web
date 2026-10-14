/**
 * Formats a date according to Argentine conventions
 * @param date The date to format
 * @param includeTime Whether to include time in the formatted output
 * @returns Formatted date string or fallback message if date is invalid
 */
export const formatDate = (date: Date | string | null | undefined, includeTime = false): string => {
  if (!date) return "Fecha no disponible";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(dateObj.getTime())) return "Fecha no disponible";

  const dateOptions = { day: "2-digit", month: "2-digit", year: "numeric" } as const;
  if (!includeTime) return dateObj.toLocaleDateString("es-AR", dateOptions);
  return dateObj.toLocaleString("es-AR", { ...dateOptions, hour: "2-digit", minute: "2-digit", hour12: false });
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
