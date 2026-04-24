export const convertBigDecimalToNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;

  if (typeof value === "string") {
    return parseFloat(value.replace(",", ".")) || 0;
  }

  if (typeof value === "number") return value;

  return Number(value) || 0;
};


