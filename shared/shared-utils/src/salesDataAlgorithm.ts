import { getCurrencySymbol } from "./getCurrencySymbol";
import { formatPrice } from "./priceFormatter";

const currency = getCurrencySymbol("USD");
export const salesDataAlgorithm = (salesData: any) => {
  const groupedData = salesData.reduce(
    (accumulator: any, currentValue: any) => {
      const { month, value } = currentValue;
      accumulator[month] = (accumulator[month] || 0) + value;
      return accumulator;
    },
    {}
  );

  const monthlySalesData = monthsOrder.map((month) => {
    const revenue = groupedData[month] || 0;
    return {
      name: month,
      value: formatPrice(revenue, currency),
      revenue,
    };
  });

  return monthlySalesData;
};

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
