import { DHL_API, getDhlHeaders } from "./shipment/resources";

export type OmenaiTrackingStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "EXCEPTION"
  | "UNKNOWN";

export interface UnifiedTrackingEvent {
  timestamp: string; // ISO 8601
  location: string;
  description: string;
  status_label: OmenaiTrackingStatus;
}

export interface UnifiedTrackingResponse {
  tracking_number: string;
  carrier: "DHL" | "UPS";
  current_status: OmenaiTrackingStatus;
  estimated_delivery: string | null;
  events: UnifiedTrackingEvent[];
  coordinates?: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  } | null;
}

// ----------------------------------------------------------------------
// 2. THE TRANSLATOR (Normalization Logic)
// ----------------------------------------------------------------------

function mapDHLStatusToOmenai(dhlCode: string): OmenaiTrackingStatus {
  // DHL Express Standard Action Codes
  const code = dhlCode.toUpperCase();

  const STATUS_MAP: Record<string, OmenaiTrackingStatus> = {
    // START
    "101": "CREATED", // Shipment info received

    // TRANSIT (Moving / Scans)
    PU: "IN_TRANSIT", // Picked Up
    PL: "IN_TRANSIT", // Processed at Location
    DF: "IN_TRANSIT", // Departed Facility
    AR: "IN_TRANSIT", // Arrived Facility
    CC: "IN_TRANSIT", // Customs Clearance processing

    // DELIVERY PHASE
    WC: "OUT_FOR_DELIVERY", // With Delivery Courier
    OD: "OUT_FOR_DELIVERY", // Out for Delivery

    // COMPLETED
    OK: "DELIVERED", // Delivery Successful
    DL: "DELIVERED", // Delivered

    // EXCEPTIONS (Bad things)
    MD: "EXCEPTION", // Missed Delivery
    BA: "EXCEPTION", // Bad Address
    NH: "EXCEPTION", // Not Home
    RR: "EXCEPTION", // Refused
    OH: "EXCEPTION", // On Hold
    RT: "EXCEPTION", // Returned
  };

  return STATUS_MAP[code] || "IN_TRANSIT"; // Default to IN_TRANSIT if unknown but moving
}

// ----------------------------------------------------------------------
// 3. THE SERVICE (The Fetcher)
// ----------------------------------------------------------------------

export async function getDHLTracking(
  trackingNumber: string,
): Promise<UnifiedTrackingResponse> {
  const isProd = process.env.APP_ENV === "production";

  const API_URL_TEST = `${DHL_API}/shipments/9356579890/tracking?trackingView=all-checkpoints&levelOfDetail=all`;

  const API_URL_PROD = `${DHL_API}/shipments/${trackingNumber}/tracking?trackingView=all-checkpoints&levelOfDetail=all`;

  const URL = isProd ? API_URL_PROD : API_URL_TEST;

  const requestOptions = {
    method: "GET",
    headers: getDhlHeaders(),
  };

  try {
    const response = await fetch(URL, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        return {
          tracking_number: trackingNumber,
          carrier: "DHL",
          current_status: "CREATED",
          estimated_delivery: null,
          events: [],
        };
      }
      throw new Error(`DHL API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const shipment = data.shipments?.[0];

    if (!shipment) {
      throw new Error("DHL returned no shipment data");
    }

    // 2. Transform Events

    const normalizedEvents: UnifiedTrackingEvent[] = (
      shipment.events || []
    ).map((ev: any) => ({
      timestamp: ev.timestamp || ev.date || new Date().toISOString(),
      location: ev.serviceArea[0].description || "Transit Location",
      description: ev.description || "Status Update",
      status_label: mapDHLStatusToOmenai(ev.typeCode),
    }));

    // 3. Determine Current Status (Head of the list)
    // If no events, it's just Created.
    const latestEvent = normalizedEvents[0];
    const currentStatus = latestEvent ? latestEvent.status_label : "CREATED";

    return {
      tracking_number: trackingNumber,
      carrier: "DHL",
      current_status: currentStatus,
      // DHL 'estimatedTimeOfDelivery' is often in the root object
      estimated_delivery:
        shipment.estimatedTimeOfDelivery ||
        shipment.estimatedDeliveryDate ||
        null,
      events: normalizedEvents,
    };
  } catch (error: any) {
    console.error("DHL Tracking Failed:", error);
    // Return Exception state rather than crashing, so UI can show "Error tracking"
    return {
      tracking_number: trackingNumber,
      carrier: "DHL",
      current_status: "EXCEPTION",
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
