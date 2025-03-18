import { ShipmentAddressValidationType } from "@omenai/shared-types";

export function validateAddressVerificationRequestData(
  data: ShipmentAddressValidationType
): string | null {
  const { type, countryCode, postalCode, cityName, countyName } = data;

  if (!type || !countryCode || !postalCode) {
    return "Missing one or more required fields";
  }

  if (typeof type !== "string" || (type !== "pickup" && type !== "delivery")) {
    return "Invalid type value";
  }

  if (typeof countryCode !== "string" || countryCode.length !== 2) {
    return "Invalid country code";
  }

  if (typeof postalCode !== "string") {
    return "Invalid postal code";
  }

  // Add more validation rules as needed

  return null;
}
