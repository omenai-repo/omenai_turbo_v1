export function calculatePurchaseGrandTotal(
  price: number,
  fees: string,
  taxes: string
): string {
  const taxesValue: number = parseFloat(taxes.replace(/[^0-9.]/g, ""));
  const feesValue: number = parseFloat(fees.replace(/[^0-9.]/g, ""));

  // Calculate total
  const total: number = price + taxesValue + feesValue;

  // Format total as string with dollar sign
  const totalString: string = total.toFixed(2);

  return totalString;
}
export function calculatePurchaseGrandTotalNumber(
  price: number,
  fees: number,
  taxes: number
): number {
  // const taxesValue: number = parseFloat(taxes.replace(/[^0-9.]/g, ""));
  // const feesValue: number = parseFloat(fees.replace(/[^0-9.]/g, ""));

  // Calculate total
  const total: number = price + taxes + fees;

  return total;
}
