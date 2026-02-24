import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import {
  BadRequestError,
  NotFoundError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { UnifiedTrackingResponse, getDHLTracking } from "../../dhl_service";
import { getUPSTracking } from "../../ups_service";
import { getLatLng } from "../resources";
import { CreateOrderModelTypes } from "@omenai/shared-types";

// 1. IMPORT YOUR GEOCODER

const TrackingQuerySchema = z.object({
  order_id: z.string().min(5),
});

export const GET = withRateLimit(standardRateLimit)(async function GET(
  req: Request,
) {
  try {
    const nextRequest = new NextRequest(req);
    const searchParams = nextRequest.nextUrl.searchParams;

    const query = { order_id: searchParams.get("order_id") };
    const validation = TrackingQuerySchema.safeParse(query);

    if (!validation.success)
      throw new BadRequestError("Invalid or missing order_id");

    const { order_id } = validation.data;

    // 2. FETCH ADDRESSES ALONG WITH TRACKING INFO
    await connectMongoDB();
    const order = (await CreateOrder.findOne({
      order_id,
    }).lean()) as unknown as CreateOrderModelTypes;

    if (!order) throw new NotFoundError("Order not found");

    const trackingInfo = order.shipping_details?.shipment_information?.tracking;
    const carrier = order.shipping_details?.shipment_information?.carrier
      .split(" ")[0]
      ?.toUpperCase();
    const addresses = order.shipping_details?.addresses;

    if (!trackingInfo?.id)
      throw new NotFoundError("This order has not been shipped yet.");

    let trackingResult: UnifiedTrackingResponse;

    if (carrier === "DHL") {
      trackingResult = await getDHLTracking(trackingInfo.id);
    } else if (carrier === "UPS") {
      trackingResult = await getUPSTracking(trackingInfo.id);
    } else {
      throw new BadRequestError(`Unsupported Carrier: ${carrier}`);
    }

    // 4. RESTORE GEOCODING (The missing piece)
    let coordinates = null;
    if (addresses) {
      try {
        const originStr = `${addresses.origin.city}, ${addresses.origin.countryCode}`;
        const destStr = `${addresses.destination.city}, ${addresses.destination.countryCode}`;

        // Run in parallel for speed
        const [originGeo, destGeo] = await Promise.all([
          getLatLng(originStr),
          getLatLng(destStr),
        ]);

        coordinates = {
          origin: originGeo,
          destination: destGeo,
        };
      } catch (geoError) {
        console.warn("Geocoding failed, map will default:", geoError);
        // We don't fail the request, just return null coordinates
      }
    }

    // 5. MERGE & RETURN
    return NextResponse.json(
      {
        success: true,
        data: {
          ...trackingResult,
          coordinates, // Now defined!
          shipping_details: order.shipping_details, // Pass this back so UI has address text
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Tracking Controller Error:", error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status },
    );
  }
});
