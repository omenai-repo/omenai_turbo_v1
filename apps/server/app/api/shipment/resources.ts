import { getCurrencyConversion } from "@omenai/shared-services/exchange_rate/getCurrencyConversion";
import { dhlErrorMap } from "../../../custom/errors/shipment/dhlErrorMap";

// DHL API keys
const API_KEY = (process.env.DHL_API_KEY || "").trim();
const API_SECRET = (process.env.DHL_API_SECRET || "").trim();

// DHL API version
export const DHL_API_VERSION = "3.0.1";

// DHL API credentials encryption
export const credentials = Buffer.from(`${API_KEY}:${API_SECRET}`).toString(
  "base64"
);

// Export a FUNCTION that creates and returns new headers
export const getDhlHeaders = () => {
  return new Headers({
    "Content-Type": "application/json",
    Authorization: `Basic ${credentials}`,
  });
};

// DHL API URL
export const DHL_API_URL_PROD = "https://express.api.dhl.com/mydhlapi";
export const DHL_API_URL_TEST = "https://express.api.dhl.com/mydhlapi/test";
export const SHIPMENT_API_URL = `${DHL_API_URL_TEST}/shipments`;

// DHL API express account number
export const OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT =
  process.env.DHL_SHIPPER_ACCOUNT!;

// async function to select the most appropriate DHL product for a particular shipment based on price and product relevance to shipment
export async function selectAppropriateDHLProduct(
  products: any[]
): Promise<any> {
  if (products === undefined || products.length === 0) {
    return null;
  }
  const acceptableProductCodes = ["P", "U", "D", "N", "H", "W", "Y"];

  // Filter for preferred products if available, otherwise consider all
  let validProducts = products.filter((product: any) =>
    acceptableProductCodes.includes(product.productCode)
  );

  if (validProducts.length === 0) {
    validProducts = products;
  }

  // Define the currency types in order of preference
  const priceTypesPriority = ["BILLC", "BASEC", "PULCL"];

  // Process each product to extract and possibly convert its price
  const processedProducts = await Promise.all(
    validProducts.map(async (product: any) => {
      let selectedPriceObj: any = null;

      // Loop through the priority list until we find a matching price object
      for (const type of priceTypesPriority) {
        selectedPriceObj = product.totalPrice.find(
          (priceObj: any) => priceObj.currencyType === type
        );
        if (selectedPriceObj) break;
      }

      // If no matching price object is found, default to 0
      if (!selectedPriceObj) {
        selectedPriceObj = product.totalPrice[0];
      }

      let chargeable_price_in_usd: number;
      // If the price's currency is not USD, convert it
      if (selectedPriceObj.priceCurrency !== "USD") {
        chargeable_price_in_usd = await convertToUSD(
          selectedPriceObj.price,
          selectedPriceObj.priceCurrency
        );
      } else {
        chargeable_price_in_usd = selectedPriceObj.price;
      }

      return {
        productCode: product.productCode,
        productName: product.productName,
        pickupCapabilities: product.pickupCapabilities,
        deliveryCapabilities: product.deliveryCapabilities,
        pricingDate: product.pricingDate,
        totalPrice: product.totalPrice,
        chargeable_price_in_usd,
      };
    })
  );

  // Sort the products by their USD-converted price (ascending)
  processedProducts.sort(
    (a: any, b: any) => a.chargeable_price_in_usd - b.chargeable_price_in_usd
  );

  // Return the cheapest product
  return processedProducts.length > 0 ? processedProducts[0] : null;
}

// API call to get the currency conversion rate
async function convertToUSD(
  amount: number,
  fromCurrency: string
): Promise<number> {
  const conversion = await getCurrencyConversion(fromCurrency, amount, "");
  if (!conversion?.isOk) {
    throw new Error("Failed to convert currency");
  }
  return conversion.data;
}

// Function to convert DHL errors into user friendly error messages
export function getUserFriendlyError(dhlErrorMessage: string): string {
  // Attempt to extract the error code using a regex pattern
  const codeMatch = dhlErrorMessage.match(/^(\d+):/);
  if (codeMatch) {
    const errorCode = codeMatch[1];
    if (dhlErrorMap[errorCode]) {
      return dhlErrorMap[errorCode];
    } else {
    }
  }
  // Return a generic friendly message if the error code is unknown or extraction fails
  return "An unexpected error occurred. Please try again later or contact support.";
}

export async function getLatLng(
  location: string
): Promise<{ lat: number; lng: number } | null> {
  const accessKey = process.env.POSITION_STACK_API;

  const url = `http://api.positionstack.com/v1/forward?access_key=${accessKey}&query=${encodeURIComponent(location)}&limit=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data?.data?.length > 0) {
      const result = data.data[0];
      console.log(result);
      return { lat: result.latitude, lng: result.longitude };
    } else {
      console.warn("No results found for location:", location);
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
