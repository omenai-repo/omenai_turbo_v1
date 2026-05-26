import { describe, it, expect } from "vitest";
import { validateAddressVerificationRequestData } from "../../../../validations/api/shipment/validateAddressVerificationRequestData";

const BASE = {
  type: "pickup" as const,
  countryCode: "US",
  postalCode: "10001",
  cityName: "New York",
  countyName: null,
};

describe("validateAddressVerificationRequestData", () => {
  it("returns null for valid pickup data", () => {
    expect(validateAddressVerificationRequestData(BASE)).toBeNull();
  });

  it("returns null for valid delivery data", () => {
    expect(
      validateAddressVerificationRequestData({ ...BASE, type: "delivery" }),
    ).toBeNull();
  });

  it("returns null when optional cityName and countyName are absent", () => {
    expect(
      validateAddressVerificationRequestData({
        type: "pickup",
        countryCode: "FR",
        postalCode: "75001",
        cityName: undefined as any,
        countyName: undefined as any,
      }),
    ).toBeNull();
  });

  it("returns error when type is missing", () => {
    expect(
      validateAddressVerificationRequestData({ ...BASE, type: "" as any }),
    ).toBe("Missing one or more required fields");
  });

  it("returns error when countryCode is missing", () => {
    expect(
      validateAddressVerificationRequestData({ ...BASE, countryCode: "" }),
    ).toBe("Missing one or more required fields");
  });

  it("returns error when postalCode is missing", () => {
    expect(
      validateAddressVerificationRequestData({ ...BASE, postalCode: "" }),
    ).toBe("Missing one or more required fields");
  });

  it("returns error for invalid type value", () => {
    expect(
      validateAddressVerificationRequestData({
        ...BASE,
        type: "warehouse" as any,
      }),
    ).toBe("Invalid type value");
  });

  it("returns error when countryCode is longer than 2 characters", () => {
    expect(
      validateAddressVerificationRequestData({ ...BASE, countryCode: "USA" }),
    ).toBe("Invalid country code");
  });

  it("returns error when countryCode is 1 character", () => {
    expect(
      validateAddressVerificationRequestData({ ...BASE, countryCode: "U" }),
    ).toBe("Invalid country code");
  });

  it("returns error when postalCode is not a string", () => {
    expect(
      validateAddressVerificationRequestData({
        ...BASE,
        postalCode: 10001 as any,
      }),
    ).toBe("Invalid postal code");
  });
});
