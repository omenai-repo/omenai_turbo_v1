import { rollbarServerInstance } from "@omenai/rollbar-config";
import { ServerError } from "../../custom/errors/dictionary/errorDictionary";
import z, { ZodType } from "zod";
import crypto from "node:crypto";
import { base_url, getApiUrl } from "@omenai/url-config/src/config";
import { getDhlHeaders, getUserFriendlyError } from "./shipment/resources";
import { BadRequestError } from "../../custom/errors/dictionary/errorDictionary";

import {
  AddressTypes,
  ClientSessionData,
  CreateOrderModelTypes,
  ExclusivityUpholdStatus,
  MetaSchema,
  PaymentLedgerTypes,
  ShipmentDimensions,
  ShipmentRateRequestTypes,
} from "@omenai/shared-types";

export function createErrorRollbarReport(
  context: string,
  error: any,
  status: number,
) {
  if (status >= 500) {
    if (error instanceof ServerError) {
      rollbarServerInstance.error(error, {
        context,
      });
    } else {
      rollbarServerInstance.error(new Error(String(error)));
    }
  }
}

export const ZMetaSchema = z.object({
  buyer_email: z.email(),
  buyer_id: z.string().optional(),
  seller_id: z.string().optional(),
  seller_email: z.string().optional(),
  seller_name: z.string().optional(),
  seller_designation: z.string().optional(),
  artwork_name: z.string().optional(),
  art_id: z.string().optional(),
  unit_price: z.union([z.string(), z.number()]).optional(),
  shipping_cost: z.union([z.string(), z.number()]).optional(),
  tax_fees: z.union([z.string(), z.number()]).optional(),
});

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 100,
): Promise<T> {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await new Promise(
          (res) => setTimeout(res, delayMs * attempt), // simple backoff
        );
      }
    }
  }

  throw lastError;
}
function hashCode(str: string): number {
  let hash = 0;

  if (str.length === 0) {
    return hash;
  }

  for (const char of str) {
    const chr = char.codePointAt(0)!;

    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }

  return hash;
}

/**
 * This is an irreversible anonymized user ID using HMAC-SHA256.
 */
export function anonymizeUserId(userId: string, secret: string): string {
  const hash = crypto.createHmac("sha256", secret).update(userId).digest("hex");

  return `omenai_${hash.slice(0, 16)}`;
}

/**
 * A function to generate a display name like "Deleted User #4821 for anonymized user name"
 */
export function anonymizeUsername(userId?: string): string {
  const suffix = userId
    ? Math.abs(hashCode(userId)).toString().slice(0, 4)
    : crypto.randomInt(0, 10000).toString().padStart(4, "0");

  return `Deleted User #${suffix}`;
}

export async function getSessionData(): Promise<ClientSessionData> {
  const res = await fetch(`${getApiUrl()}/api/auth/session/user`, {
    headers: {
      "Content-Type": "application/json",
      Origin: base_url(),
    },
    credentials: "include",
  });
  if (!res.ok) {
    return { isLoggedIn: false, user: null, csrfToken: "" };
  }
  const { user, csrfToken } = await res.json();
  return { isLoggedIn: true, user: user.userData, csrfToken };
}

export function buildPricing(
  meta: any,
  exclusivity_uphold_status: ExclusivityUpholdStatus,
) {
  const { isBreached, incident_count } = exclusivity_uphold_status;

  const safeIncidents = Number(incident_count) || 0;
  const penalty_rate = (10 * Math.min(safeIncidents, 6)) / 100;
  const penalty_fee = isBreached
    ? penalty_rate * Number(meta.unit_price ?? 0)
    : 0;

  const commission = Math.round(0.39 * Number(meta.unit_price ?? 0));

  return { penalty_fee, commission };
}

import { ShipmentAddressValidationType } from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";

export async function validateDHLAddress(data: ShipmentAddressValidationType) {
  const { type, countryCode, postalCode, cityName, countyName, country } = data;

  const requestOptions = {
    method: "GET",
    headers: getDhlHeaders(),
  };

  const response = await fetch(
    `https://express.api.dhl.com/mydhlapi/test/address-validate?type=${type}&countryCode=${countryCode}&cityName=${cityName?.toLowerCase() || country}&postalCode=${postalCode}&countyName=${countyName?.toLowerCase() || cityName || country}&strictValidation=${false}`,
    requestOptions,
  );

  const result = await response.json();
  console.log(result);

  if (!response.ok) {
    const error_message = getUserFriendlyError(result.detail);
    throw new BadRequestError(error_message);
  }

  return result;
}

const API_URL = getApiUrl();
const HEADERS = {
  "Content-Type": "application/json",
};
// FILE: packages/shared-lib/shipment/rateService.ts (Create this file)

export async function calculateShipmentRate(
  order: CreateOrderModelTypes,
  dimensions: ShipmentDimensions,
) {
  const { origin, destination } = order.shipping_details.addresses;

  // 1. CONSTRUCT DHL PAYLOAD
  // ⚠️ COPY THE LOGIC FROM YOUR EXISTING '/api/shipment/rate' ROUTE HERE ⚠️
  const payload = {
    customerDetails: {
      shipperDetails: {
        postalCode: origin.zip,
        cityName: origin.city,
        countryCode: origin.countryCode,
        provinceCode: origin.stateCode,
        addressLine1: origin.address_line,
        countyName: origin.city,
      },
      receiverDetails: {
        postalCode: destination.zip,
        cityName: destination.city,
        countryCode: destination.countryCode,
        provinceCode: destination.stateCode,
        addressLine1: destination.address_line,
        countyName: destination.city,
      },
    },
    accounts: [
      {
        typeCode: "shipper",
        number: process.env.DHL_ACCOUNT_NUMBER, // Ensure this ENV is available
      },
    ],
    plannedShippingDateAndTime: new Date().toISOString(),
    unitOfMeasurement: "metric",
    isCustomsDeclarable: true,
    monetaryAmount: [
      {
        typeCode: "declaredValue",
        value: order.artwork_data.pricing.usd_price,
        currency: "USD",
      },
    ],
    packages: [
      {
        weight: dimensions.weight,
        dimensions: {
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
        },
      },
    ],
  };

  // 2. CALL DHL DIRECTLY (This bypasses your middleware)
  const response = await fetch(
    "https://express.api.dhl.com/mydhlapi/test/rates?strictValidation=true",
    {
      method: "POST",
      headers: getDhlHeaders(),
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error_msg = getUserFriendlyError(data.detail);
    throw new BadRequestError(error_msg);
  }

  // Return the first product (usually the best rate)
  return data.products[0];
}

export async function validateRequestBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: any;

  // 1. Safe JSON Parsing
  try {
    body = await request.json();
    console.log("safely parsed");
  } catch (error) {
    throw new BadRequestError(
      "Invalid JSON syntax: Request body could not be parsed.",
    );
  }

  // 2. Zod Validation & Sanitization
  const validationResult = schema.safeParse(body);
  console.log(validationResult);

  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues
      .map((e: any) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");

    throw new BadRequestError(`Validation Failed: ${errorMessage}`);
  }

  // 3. Return Clean Data (Typed automatically)
  return validationResult.data;
}
