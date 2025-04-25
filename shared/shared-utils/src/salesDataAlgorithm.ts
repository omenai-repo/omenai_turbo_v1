import { getCurrencySymbol } from "./getCurrencySymbol";
import { formatPrice } from "./priceFormatter";

const currency = getCurrencySymbol("USD");

const monthsOrder = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const salesDataAlgorithm = (salesData: any, id: string) => {
  // If salesData is empty, we'll just return an empty structure with 0 for all months
  if (!salesData || salesData.length === 0) {
    return {
      id,
      data: monthsOrder.map((month) => ({
        x: month,
        y: 0,
      })),
    };
  }

  // Group data by month
  const groupedData = salesData.reduce(
    (accumulator: any, currentValue: any) => {
      const { month, value } = currentValue;
      accumulator[month] = (accumulator[month] || 0) + value;
      return accumulator;
    },
    {}
  );

  // Map the months in order and ensure each month has a y value
  const nivoFormatted = {
    id,
    data: monthsOrder.map((month) => ({
      x: month,
      y: groupedData[month] || 0, // Default to 0 if no data for the month
    })),
  };

  return nivoFormatted;
};
