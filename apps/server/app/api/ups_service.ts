import {
  AddressTypes,
  ShipmentDimensions,
  ShipmentRequestDataTypes,
} from "@omenai/shared-types";
import { createErrorRollbarReport } from "./util";

import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import crypto from "crypto";
import { FailedPickup } from "@omenai/shared-models/models/crons/FailedPickup";
import { getFutureShipmentDate } from "@omenai/shared-utils/src/getFutureShipmentDate";
import { redis } from "@omenai/upstash-config";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { PDFDocument } from "pdf-lib";

// ----------------------------------------------------------------------
// CONFIGURATION & CONSTANTS
// ----------------------------------------------------------------------

interface NormalizedRate {
  chargeable_price_in_usd: number;
  productName: string;
  productCode: string;
}

const OMENAI_SHIPPER_DETAILS = {
  Name: process.env.DHL_SHIPPER_NAME!,
  AttentionName: process.env.DHL_SHIPPER_COMPANY!,
  ShipperNumber: process.env.UPS_ACCOUNT_NUMBER!,
  Address: {
    AddressLine: [process.env.DHL_SHIPPER_ADDRESS],
    City: process.env.DHL_SHIPPER_CITY!,
    StateProvinceCode: "IL",
    PostalCode: process.env.DHL_SHIPPER_POSTAL_CODE,
    CountryCode: process.env.DHL_SHIPPER_COUNTRY,
  },
  Phone: { Number: process.env.DHL_SHIPPER_PHONE },
  EmailAddress: process.env.DHL_SHIPPER_EMAIL,
};

const UPS_VERSION = "v2409";

const UPS_PROD_URL = `https://onlinetools.ups.com`;
const UPS_TEST_URL = `https://wwwcie.ups.com`;
const UPS_BASE_URL =
  process.env.APP_ENV === "production" ? UPS_PROD_URL : UPS_TEST_URL;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ----------------------------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------------------------

async function getUPSAccessToken(): Promise<string> {
  const cacheKey = "ups_oauth_token";
  const cachedToken = await redis.get(cacheKey);
  if (cachedToken && typeof cachedToken === "string") return cachedToken;

  const clientId = process.env.UPS_CLIENT_ID;
  const clientSecret = process.env.UPS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing UPS Credentials");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  try {
    const response = await fetch(`${UPS_BASE_URL}/security/v1/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(JSON.stringify(await response.json()));
    }

    const data = await response.json();
    await redis.set(cacheKey, data.access_token, {
      ex: Number(data.expires_in) - 60,
    });
    return data.access_token;
  } catch (error: any) {
    console.error("UPS Auth Error:", error.message);
    throw new Error("Failed to authenticate with UPS");
  }
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

async function sendPickupFailedEmailWorkflow(
  orderId: string,
  carrier: string,
  errorMsg: string,
) {
  await createWorkflow(
    "/api/workflows/emails/sendPickupFailedEmail",
    `pickup_failed_${orderId}_${generateDigit(4)}`,
    JSON.stringify({
      orderId,
      carrier,
      error: errorMsg,
      adminEmail: process.env.ADMIN_EMAIL,
      devEmail: process.env.DEV_EMAIL,
    }),
  );
}

function convertToImperial(dimensions: ShipmentDimensions): ShipmentDimensions {
  return {
    weight: Number((dimensions.weight * 2.20462).toFixed(2)),
    length: Number((dimensions.length / 2.54).toFixed(2)),
    width: Number((dimensions.width / 2.54).toFixed(2)),
    height: Number((dimensions.height / 2.54).toFixed(2)),
  };
}

function mapServiceCodeToName(code: string): string {
  const map: Record<string, string> = {
    "03": "Ground",
    "02": "2nd Day Air",
    "01": "Next Day Air",
    "12": "3 Day Select",
  };
  return map[code] || `Service ${code}`;
}

// ----------------------------------------------------------------------
// 1. RATE API (v2409)
// ----------------------------------------------------------------------

export async function getUPSRates(
  origin: AddressTypes,
  destination: AddressTypes,
  metricDimensions: ShipmentDimensions,
): Promise<NormalizedRate> {
  const token = await getUPSAccessToken();
  const dimensions = convertToImperial(metricDimensions);

  const payload = {
    RateRequest: {
      Request: {
        TransactionReference: { CustomerContext: "OmenaiRate" },
      },
      PickupType: {
        Code: "06",
        Description: "One Time Pickup",
      },
      Shipment: {
        // 1. Shipper = Omenai (Account Holder)
        Shipper: OMENAI_SHIPPER_DETAILS,
        // 2. ShipFrom = Seller (Physical Origin)
        ShipFrom: {
          Name: "Seller Origin",
          Address: {
            AddressLine: [origin.address_line],
            City: origin.city,
            StateProvinceCode: origin.stateCode,
            PostalCode: origin.zip,
            CountryCode: origin.countryCode,
          },
        },
        // 3. ShipTo = Buyer
        ShipTo: {
          Name: "Buyer Destination",
          Address: {
            AddressLine: [destination.address_line],
            City: destination.city,
            StateProvinceCode: destination.stateCode,
            PostalCode: destination.zip,
            CountryCode: destination.countryCode,
          },
        },
        Package: {
          PackagingType: { Code: "02", Description: "Package" },
          Dimensions: {
            UnitOfMeasurement: { Code: "IN" },
            Length: String(dimensions.length),
            Width: String(dimensions.width),
            Height: String(dimensions.height),
          },
          PackageWeight: {
            UnitOfMeasurement: { Code: "LBS" },
            Weight: String(dimensions.weight),
          },
        },
      },
    },
  };

  try {
    // UPDATED: requestOption as query param
    const response = await fetch(
      `${UPS_BASE_URL}/api/rating/${UPS_VERSION}/Shop?requestOption=Shop`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          transId: crypto.randomUUID(),
          transactionSrc: "Omenai",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg =
        errorData?.response?.errors?.[0]?.message || "Unknown UPS Error";
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const ratedShipment = data.RateResponse.RatedShipment;
    const services = Array.isArray(ratedShipment)
      ? ratedShipment
      : [ratedShipment];

    const cheapestService = services.sort((a: any, b: any) => {
      return (
        parseFloat(a.TotalCharges.MonetaryValue) -
        parseFloat(b.TotalCharges.MonetaryValue)
      );
    })[0];

    if (!cheapestService) throw new Error("No valid UPS services found.");

    return {
      chargeable_price_in_usd: parseFloat(
        cheapestService.TotalCharges.MonetaryValue,
      ),
      productName: `UPS ${mapServiceCodeToName(cheapestService.Service.Code)}`,
      productCode: cheapestService.Service.Code,
    };
  } catch (error: any) {
    createErrorRollbarReport("UPS Rate Error", error, 500);
    throw new Error(`Rate Error: ${error.message}`);
  }
}

// ----------------------------------------------------------------------
// 2. PICKUP API (v2409)
// ----------------------------------------------------------------------

function mapToPickupServiceCode(shipmentCode: string): string {
  const map: Record<string, string> = {
    "01": "001", // Next Day Air
    "02": "002", // 2nd Day Air
    "03": "003", // Ground
    "12": "012", // 3 Day Select
    "11": "011", // Standard
    "13": "013", // Next Day Air Saver
    "14": "014", // Next Day Air Early
    "65": "065", // Saver
  };
  // Default to "003" (Ground) if unknown, to prevent crashes
  return map[shipmentCode] || "003";
}
export async function scheduleUPSPickup(
  data: ShipmentRequestDataTypes,
  dimensions: ShipmentDimensions,
) {
  const token = await getUPSAccessToken();
  const nextBusinessDate = await getFutureShipmentDate(1, false, "US");
  const pickupDate = nextBusinessDate.replace(/-/g, "");

  const pickupServiceCode = mapToPickupServiceCode(data.shipment_product_code);
  const payload = {
    PickupCreationRequest: {
      Request: {
        // ADDED: Request Field
        TransactionReference: { CustomerContext: "OmenaiPickup" },
      },
      RatePickupIndicator: "N",
      Shipper: {
        Account: {
          AccountNumber: process.env.UPS_ACCOUNT_NUMBER,
          AccountCountryCode: "US",
        },
      },
      PickupDateInfo: {
        CloseTime: "1700",
        ReadyTime: "0900",
        PickupDate: pickupDate,
      },
      PickupAddress: {
        CompanyName: data.seller_details.fullname,
        ContactName: data.seller_details.fullname,
        AddressLine: [data.seller_details.address.address_line],
        City: data.seller_details.address.city,
        StateProvince: data.seller_details.address.stateCode,
        PostalCode: data.seller_details.address.zip,
        CountryCode: "US",
        Phone: { Number: data.seller_details.phone },
        ResidentialIndicator: "Y",
      },
      // IMPORTANT: AlternateAddressIndicator = Y (Pickup is at Seller's, not Account Holder's)
      AlternateAddressIndicator: "Y",
      PickupPiece: [
        {
          ServiceCode: pickupServiceCode,
          Quantity: "1",
          DestinationCountryCode: "US",
          ContainerCode: "01",
        },
      ],
      TotalWeight: {
        Weight: String(dimensions.weight),
        UnitOfMeasurement: "LBS",
      },
      OverweightIndicator: "N",
      PaymentMethod: "01",
    },
  };

  const response = await fetch(
    `${UPS_BASE_URL}/api/pickupcreation/${UPS_VERSION}/pickup`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        transId: crypto.randomUUID(),
        transactionSrc: "Omenai",
      },
      body: JSON.stringify(payload),
    },
  );

  // 1. Get Raw Text FIRST (Don't use .json() yet)
  const rawText = await response.text();

  // 3. Handle Errors Safely
  if (!response.ok) {
    throw new Error(`UPS Error (${response.status}): ${rawText}`);
  }

  // 4. Parse JSON only if it's not empty
  return rawText ? JSON.parse(rawText) : { message: "Success with empty body" };
}

// ----------------------------------------------------------------------
// 4. TIME IN TRANSIT API (Real Estimate)
// ----------------------------------------------------------------------

async function getUPSTimeInTransit(
  token: string,
  data: ShipmentRequestDataTypes,
  dimensions: ShipmentDimensions,
): Promise<string> {
  // Format today as YYYY-MM-DD for the request
  const today = new Date().toISOString().split("T")[0];

  const payload = {
    originCountryCode: "US", // Assuming US-US domestic
    originPostalCode: data.seller_details.address.zip,
    originCityName: data.seller_details.address.city,
    destinationCountryCode: "US",
    destinationPostalCode: data.receiver_address.zip,
    destinationCityName: data.receiver_address.city,
    weight: String(dimensions.weight),
    weightUnitOfMeasurement: "LBS",
    shipmentContentsValue: String(data.artwork_price),
    shipmentContentsCurrencyCode: "USD",
    billType: "03", // Pre-paid
    shipDate: today,
    shipTime: "10:00:00", // Assumed drop-off time
  };

  try {
    const response = await fetch(
      `${UPS_BASE_URL}/api/shipments/v1/transittimes`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          transId: crypto.randomUUID(),
          transactionSrc: "Omenai",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      // If TNT fails, fallback to a safe manual estimate rather than crashing the shipment
      console.warn("UPS TNT API failed, falling back to manual estimate.");
      return calculateManualEstimate(data.shipment_product_code);
    }

    const result = await response.json();

    // The API returns a list of services (Ground, Next Day, etc.)
    // We must find the one matching our `shipment_product_code`
    const services = result.transitTimes || [];
    const matchedService = services.find(
      (s: any) => s.serviceCode === data.shipment_product_code,
    );

    if (matchedService && matchedService.arrivalDate) {
      return matchedService.arrivalDate; // Returns YYYY-MM-DD
    }

    // Fallback if specific service not found in list
    return calculateManualEstimate(data.shipment_product_code);
  } catch (error) {
    console.error("UPS TNT Error:", error);
    return calculateManualEstimate(data.shipment_product_code);
  }
}

// Fallback logic (just in case API is down)
function calculateManualEstimate(serviceCode: string): string {
  const today = new Date();
  let days = serviceCode === "01" ? 1 : serviceCode === "02" ? 2 : 5;
  let added = 0;
  while (added < days) {
    today.setDate(today.getDate() + 1);
    if (today.getDay() !== 0 && today.getDay() !== 6) added++;
  }
  return today.toISOString();
}

import { Jimp } from "jimp"; // Import Jimp

export async function createUPSShipment(
  data: ShipmentRequestDataTypes,
): Promise<any> {
  const token = await getUPSAccessToken();
  const dimensions = convertToImperial(data.dimensions);
  const estimatedDeliveryDate = await getUPSTimeInTransit(
    token,
    data,
    dimensions,
  );

  const shipPayload = {
    ShipmentRequest: {
      Request: {
        RequestOption: "nonvalidate",
        TransactionReference: { CustomerContext: "OmenaiShip" },
      },
      Shipment: {
        Description: data.artwork_name,
        // 1. Shipper = Omenai (Account Owner) with ShipperNumber
        Shipper: OMENAI_SHIPPER_DETAILS,

        // 2. ShipFrom = Seller (Pickup Location)
        ShipFrom: {
          Name: data.seller_details.fullname.substring(0, 35),
          Address: {
            AddressLine: [
              data.seller_details.address.address_line.substring(0, 35),
            ],
            City: data.seller_details.address.city,
            StateProvinceCode: data.seller_details.address.stateCode,
            PostalCode: data.seller_details.address.zip,
            CountryCode: data.seller_details.address.countryCode,
          },
        },

        // 3. ShipTo = Buyer
        ShipTo: {
          Name: data.receiver_data.fullname,
          AttentionName: data.receiver_data.fullname,
          Phone: { Number: data.receiver_data.phone },
          Address: {
            AddressLine: [data.receiver_address.address_line],
            City: data.receiver_address.city,
            StateProvinceCode: data.receiver_address.stateCode,
            PostalCode: data.receiver_address.zip,
            CountryCode: data.receiver_address.countryCode,
          },
        },
        PaymentInformation: {
          ShipmentCharge: {
            Type: "01", // Bill Shipper
            BillShipper: { AccountNumber: process.env.UPS_ACCOUNT_NUMBER },
          },
        },
        Service: {
          Code: data.shipment_product_code,
          Description: "UPS Service",
        },
        Package: {
          Description: "Artwork",
          Packaging: { Code: "02" },
          Dimensions: {
            UnitOfMeasurement: { Code: "IN" },
            Length: String(dimensions.length),
            Width: String(dimensions.width),
            Height: String(dimensions.height),
          },
          PackageWeight: {
            UnitOfMeasurement: { Code: "LBS" },
            Weight: String(dimensions.weight),
          },
        },
        // UPDATED: Label Specification
        LabelSpecification: {
          LabelImageFormat: { Code: "PNG" },
          HTTPUserAgent: "Mozilla/5.0",
          LabelStockSize: { Height: "6", Width: "4" },
        },
      },
    },
  };

  let trackingNumber = "";
  let labelContent = "";

  try {
    const response = await fetch(
      `${UPS_BASE_URL}/api/shipments/${UPS_VERSION}/ship`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          transId: crypto.randomUUID(),
          transactionSrc: "Omenai",
        },
        body: JSON.stringify(shipPayload),
      },
    );

    const result = await response.json();
    if (!response.ok || !result.ShipmentResponse) {
      console.error(
        "❌ UPS Shipment Failed. Full Response:",
        JSON.stringify(result, null, 2),
      );

      // Extract the specific error message from UPS if possible
      const errorMsg =
        result.response?.errors?.[0]?.message || "Unknown UPS Error";
      const errorCode = result.response?.errors?.[0]?.code || "Unknown Code";

      throw new Error(`UPS Create Error: ${errorCode} - ${errorMsg}`);
    }

    const rawResults = result.ShipmentResponse.ShipmentResults.PackageResults;
    const pkg = Array.isArray(rawResults) ? rawResults[0] : rawResults;

    let finalLabelContent = pkg.ShippingLabel.GraphicImage;

    // 2. THE ROBUST CONVERTER (GIF -> PNG -> PDF)
    try {
      // A. Decode Base64 to Buffer
      const labelBuffer = Buffer.from(finalLabelContent, "base64");

      // B. Convert Image to PNG using Jimp (Handles GIF, BMP, JPG input)
      const image = await Jimp.read(labelBuffer);
      const pngBuffer = await image.getBuffer("image/png");

      // C. Create PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([288, 432]); // 4x6 inches

      // D. Embed the Converted PNG
      const pngImage = await pdfDoc.embedPng(pngBuffer);
      const { width, height } = pngImage.scaleToFit(288, 432);

      // E. Draw on Page
      page.drawImage(pngImage, {
        x: page.getWidth() / 2 - width / 2,
        y: page.getHeight() / 2 - height / 2,
        width,
        height,
      });

      // F. Save as PDF Base64
      finalLabelContent = await pdfDoc.saveAsBase64();

      console.log("✅ Successfully converted UPS Label to PDF");
    } catch (conversionError) {
      console.error("⚠️ PDF Conversion Critical Failure:", conversionError);
      // We still return the raw content if this fails, so the user gets *something*
    }

    return {
      shipmentTrackingNumber:
        result.ShipmentResponse.ShipmentResults.ShipmentIdentificationNumber,
      estimatedDeliveryDate: estimatedDeliveryDate,
      plannedShippingDateAndTime: new Date().toISOString(),
      documents: [
        {
          content: finalLabelContent, // Valid PDF string
        },
      ],
    };
  } catch (error: any) {
    createErrorRollbarReport("UPS Shipment Failed", error, 500);
    throw new Error(`UPS Create Error: ${error.message}`);
  }

  // -------------------------------------------------
  // PICKUP SCHEDULING (Retry Loop)
  // -------------------------------------------------
  let attempt = 0;
  let pickupSuccess = false;

  while (attempt < 3 && !pickupSuccess) {
    try {
      await scheduleUPSPickup(data, dimensions);
      pickupSuccess = true;
    } catch (pickupError: any) {
      attempt++;
      if (attempt >= 3) {
        // FAIL SAFE: Log to DB & Email
        const orderId = data.invoice_number.replace("OMENAI-INV-", "");
        try {
          // TODO: Remove this when we push to github
          await connectMongoDB();
          await FailedPickup.create({
            order_id: orderId,
            carrier: "UPS",
            error_message: pickupError.message || JSON.stringify(pickupError),
            status: "pending",
            retry_count: 3,
            payload_snapshot: { data, dimensions },
          });
          await sendPickupFailedEmailWorkflow(
            orderId,
            "UPS",
            pickupError.message,
          );
        } catch (dbErr) {
          console.error("DB Save Failed", dbErr);
        }
      } else {
        await wait(2000);
      }
    }
  }

  return {
    shipmentTrackingNumber: trackingNumber,
    estimatedDeliveryDate: estimatedDeliveryDate,
    plannedShippingDateAndTime: new Date().toISOString(),
    documents: [{ content: labelContent }], // Base64 GIF
  };
}

// _------------------------------------------------------
// 5. TRACKING API (v2409)
// ----------------------------------------------------------------------

import {
  UnifiedTrackingResponse,
  UnifiedTrackingEvent,
  OmenaiTrackingStatus,
} from "./dhl_service";

// ----------------------------------------------------------------------
// 1. THE TRANSLATOR (Normalization Logic)
// ----------------------------------------------------------------------
function formatUPSDate(dateStr: string, timeStr: string): string {
  if (!dateStr || dateStr.length !== 8) return new Date().toISOString();

  // Format Date: "20260218" -> "2026-02-18"
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  // Format Time: "103000" -> "10:30:00"
  // Pad with leading zero just in case UPS sends "93000" for 9:30 AM
  const cleanTime = (timeStr || "000000").padStart(6, "0");
  const hour = cleanTime.substring(0, 2);
  const min = cleanTime.substring(2, 4);
  const sec = cleanTime.substring(4, 6);

  return `${year}-${month}-${day}T${hour}:${min}:${sec}`;
}
function mapUPSStatusToOmenai(
  upsCode: string,
  type: string,
): OmenaiTrackingStatus {
  // UPS uses a mix of "Status Type" (I, D, X, M) and "Activity Codes"

  // High Level Types:
  // I = In Transit
  // D = Delivered
  // X = Exception
  // P = Pickup
  // M = Manifest Pickup

  if (type === "D") return "DELIVERED";
  if (type === "X") return "EXCEPTION";
  if (type === "M") return "CREATED"; // Label Created
  if (type === "P") return "IN_TRANSIT"; // Pickup Scan

  // Granular Codes (Activity)
  const code = upsCode.toUpperCase();
  const STATUS_MAP: Record<string, OmenaiTrackingStatus> = {
    OR: "IN_TRANSIT", // Origin Scan
    AR: "IN_TRANSIT", // Arrival Scan
    DP: "IN_TRANSIT", // Departure Scan
    OT: "OUT_FOR_DELIVERY", // Out for Delivery
    KB: "EXCEPTION", // Missed
    "24": "EXCEPTION", // Signature Required
  };

  return STATUS_MAP[code] || "IN_TRANSIT";
}

// ----------------------------------------------------------------------
// 2. THE SERVICE (The Fetcher)
// ----------------------------------------------------------------------

export async function getUPSTracking(
  trackingNumber: string,
): Promise<UnifiedTrackingResponse> {
  const token = await getUPSAccessToken();

  // UPS REST Tracking Endpoint (v1 is standard for tracking)
  const url = `${UPS_BASE_URL}/api/track/v1/details/${trackingNumber}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        transId: crypto.randomUUID(),
        transactionSrc: "Omenai",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Handle "Not Found" (Label created but not scanned yet)
      if (response.status === 404) {
        return {
          tracking_number: trackingNumber,
          carrier: "UPS",
          current_status: "CREATED",
          estimated_delivery: null,
          events: [],
        };
      }
      throw new Error(`UPS Tracking Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const packageData = data.trackResponse.shipment[0].package[0];

    if (!packageData) throw new Error("No package data found in UPS response");

    // 2. Transform Events
    // UPS returns 'activity' array. Usually sorted Descending.
    const rawActivities = packageData.activity || [];

    const normalizedEvents: UnifiedTrackingEvent[] = rawActivities.map(
      (act: any) => ({
        timestamp: formatUPSDate(act.date, act.time),
        location: act.location?.address?.city || "Transit Location",
        description: act.status?.description || "Status Update",
        status_label: mapUPSStatusToOmenai(act.status?.code, act.status?.type),
      }),
    );

    // 3. Determine Current Status
    // UPS usually puts the current status in packageData.currentStatus
    const currentStatus = mapUPSStatusToOmenai(
      packageData.currentStatus.code,
      packageData.currentStatus.type,
    );

    return {
      tracking_number: trackingNumber,
      carrier: "UPS",
      current_status: currentStatus,
      // UPS often provides 'deliveryDate' in the root
      estimated_delivery:
        packageData.deliveryDate && packageData.deliveryDate[0]
          ? formatUPSDate(
              packageData.deliveryDate[0].date,
              packageData.deliveryDate[0].time,
            )
          : null,
      events: normalizedEvents,
    };
  } catch (error: any) {
    console.error("UPS Tracking Failed:", error);
    return {
      tracking_number: trackingNumber,
      carrier: "UPS",
      current_status: "EXCEPTION", // Fail safe
      estimated_delivery: null,
      events: [
        {
          timestamp: new Date().toISOString(),
          location: "System",
          description: "Tracking currently unavailable",
          status_label: "EXCEPTION",
        },
      ],
    };
  }
}
