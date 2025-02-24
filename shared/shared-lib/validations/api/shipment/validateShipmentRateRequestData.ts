import { ShipmentRateRequestTypes } from "@omenai/shared-types";
import { z } from "zod";

// creating a schema for strings
const mySchema = z.string();
export function validateShipmentRateRequest(
  data: ShipmentRateRequestTypes
): string | null {
  const {
    originCountryCode,
    originCityName,
    originPostalCode,
    destinationCountryCode,
    destinationCityName,
    destinationPostalCode,
    weight,
    length,
    width,
    height,
  } = data;

  if (
    !originCountryCode ||
    !originCityName ||
    !originPostalCode ||
    !destinationCountryCode ||
    !destinationCityName ||
    !destinationPostalCode ||
    !weight ||
    !length ||
    !width ||
    !height
  ) {
    return "Missing one or more required fields";
  }
  if (typeof originCountryCode !== "string" || originCountryCode.length !== 2) {
    return "Invalid origin country code";
  }

  if (
    typeof destinationCountryCode !== "string" ||
    destinationCountryCode.length !== 2
  ) {
    return "Invalid destination country code";
  }

  if (typeof weight !== "number" || weight <= 0) {
    return "Invalid weight";
  }

  if (typeof length !== "number" || length <= 0) {
    return "Invalid length";
  }

  if (typeof width !== "number" || width <= 0) {
    return "Invalid width";
  }

  if (typeof height !== "number" || height <= 0) {
    return "Invalid height";
  }

  // Add more validation rules as needed

  return null;
}
