import { describe, it, expect } from "vitest";
import { validateShipmentRateRequest } from "../../../../validations/api/shipment/validateShipmentRateRequestData";

const VALID = {
  originCountryCode: "US",
  originCityName: "New York",
  originPostalCode: "10001",
  destinationCountryCode: "DE",
  destinationCityName: "Berlin",
  destinationPostalCode: "10115",
  weight: 5,
  length: 50,
  width: 40,
  height: 10,
};

describe("validateShipmentRateRequest", () => {
  it("returns null for valid data", () => {
    expect(validateShipmentRateRequest(VALID)).toBeNull();
  });

  it("returns error when originCountryCode is missing", () => {
    expect(
      validateShipmentRateRequest({ ...VALID, originCountryCode: "" }),
    ).toBe("Missing one or more required fields");
  });

  it("returns error when originCityName is missing", () => {
    expect(
      validateShipmentRateRequest({ ...VALID, originCityName: "" }),
    ).toBe("Missing one or more required fields");
  });

  it("returns error when originPostalCode is missing", () => {
    expect(
      validateShipmentRateRequest({ ...VALID, originPostalCode: "" }),
    ).toBe("Missing one or more required fields");
  });

  it("returns error when destinationCountryCode is missing", () => {
    expect(
      validateShipmentRateRequest({ ...VALID, destinationCountryCode: "" }),
    ).toBe("Missing one or more required fields");
  });

  it("returns error when destinationCityName is missing", () => {
    expect(
      validateShipmentRateRequest({ ...VALID, destinationCityName: "" }),
    ).toBe("Missing one or more required fields");
  });

  it("returns error when destinationPostalCode is missing", () => {
    expect(
      validateShipmentRateRequest({ ...VALID, destinationPostalCode: "" }),
    ).toBe("Missing one or more required fields");
  });

  it("returns error when weight is zero", () => {
    expect(validateShipmentRateRequest({ ...VALID, weight: 0 })).toBe(
      "Missing one or more required fields",
    );
  });

  it("returns error when length is zero", () => {
    expect(validateShipmentRateRequest({ ...VALID, length: 0 })).toBe(
      "Missing one or more required fields",
    );
  });

  it("returns error when width is zero", () => {
    expect(validateShipmentRateRequest({ ...VALID, width: 0 })).toBe(
      "Missing one or more required fields",
    );
  });

  it("returns error when height is zero", () => {
    expect(validateShipmentRateRequest({ ...VALID, height: 0 })).toBe(
      "Missing one or more required fields",
    );
  });

  it("returns error when originCountryCode is not 2 characters", () => {
    expect(
      validateShipmentRateRequest({ ...VALID, originCountryCode: "USA" }),
    ).toBe("Invalid origin country code");
  });

  it("returns error when destinationCountryCode is not 2 characters", () => {
    expect(
      validateShipmentRateRequest({ ...VALID, destinationCountryCode: "DEU" }),
    ).toBe("Invalid destination country code");
  });

  it("returns error when weight is negative", () => {
    expect(validateShipmentRateRequest({ ...VALID, weight: -1 })).toBe(
      "Invalid weight",
    );
  });

  it("returns error when length is negative", () => {
    expect(validateShipmentRateRequest({ ...VALID, length: -5 })).toBe(
      "Invalid length",
    );
  });

  it("returns error when width is negative", () => {
    expect(validateShipmentRateRequest({ ...VALID, width: -3 })).toBe(
      "Invalid width",
    );
  });

  it("returns error when height is negative", () => {
    expect(validateShipmentRateRequest({ ...VALID, height: -10 })).toBe(
      "Invalid height",
    );
  });
});
