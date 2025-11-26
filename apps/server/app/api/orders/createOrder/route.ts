import { sendOrderRequestToGalleryMail } from "@omenai/shared-emails/src/models/orders/orderRequestToGallery";
import { sendOrderRequestReceivedMail } from "@omenai/shared-emails/src/models/orders/orderRequestReceived";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { NextResponse } from "next/server";
import {
  ServerError,
  ForbiddenError,
  BadRequestError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { getApiUrl } from "@omenai/url-config/src/config";
import { getCurrentDate } from "@omenai/shared-utils/src/getCurrentDate";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  AddressTypes,
  ArtworkSchemaTypes,
  CombinedConfig,
  CreateOrderModelTypes,
  NotificationPayload,
} from "@omenai/shared-types";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["user"],
};

// Unified helper to fetch seller data
const getSellerData = async (seller_id: string, designation: string) => {
  if (designation === "gallery") {
    return AccountGallery.findOne(
      { gallery_id: seller_id },
      "name email address phone address"
    ).lean() as unknown as {
      name: string;
      email: string;
      user_id: string;
      phone: string;
      address: AddressTypes;
    };
  }
  return AccountArtist.findOne(
    { artist_id: seller_id },
    "name email address phone address"
  ).lean() as unknown as {
    name: string;
    email: string;
    user_id: string;
    phone: string;
    address: AddressTypes;
  };
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const {
      buyer_id,
      art_id,
      seller_id,
      save_shipping_address,
      shipping_address,
      designation,
    }: {
      buyer_id: string;
      art_id: string;
      seller_id: string;
      save_shipping_address: boolean;
      shipping_address: AddressTypes;
      designation: string;
    } = await request.json();

    // Basic input validation
    if (!buyer_id || !art_id || !seller_id) {
      throw new BadRequestError("Missing required parameters.");
    }

    // Fetch buyer & seller data concurrently
    const [buyerData, sellerData] = await Promise.all([
      AccountIndividual.findOne(
        { user_id: buyer_id },
        "name email user_id phone address"
      ).lean() as unknown as {
        name: string;
        email: string;
        user_id: string;
        phone: string;
        address: AddressTypes;
      },
      getSellerData(seller_id, designation),
    ]);

    if (!buyerData || !sellerData) {
      throw new ServerError("Unable to retrieve user information.");
    }

    // Validate shipping address via DHL API
    const validationResponse = await fetch(
      `${getApiUrl()}/api/shipment/address_validation`,
      {
        method: "POST",
        body: JSON.stringify({
          type: "delivery",
          countryCode: shipping_address.countryCode,
          postalCode: shipping_address.zip,
          cityName: shipping_address.state,
          countyName: shipping_address.city,
          country: shipping_address.country,
        }),
        headers: {
          "Content-Type": "application/json",
          Origin: "https://omenai.app",
        },
      }
    );

    const validationResult = await validationResponse.json();
    if (!validationResponse.ok) {
      throw new BadRequestError(
        validationResult.message ||
          "Oops! We can't ship to this address yet. Try another address."
      );
    }

    // Fetch artwork details
    const artwork = (await Artworkuploads.findOne(
      { art_id },
      "title artist pricing url art_id availability role_access exclusivity_status"
    ).lean()) as unknown as Pick<
      ArtworkSchemaTypes,
      | "title"
      | "artist"
      | "pricing"
      | "art_id"
      | "availability"
      | "role_access"
      | "exclusivity_status"
    >;

    if (!artwork) {
      throw new ServerError("Artwork not found.");
    }

    // Prevent duplicate order creation
    const existingOrder = (await CreateOrder.findOne({
      "buyer_details.email": buyerData.email,
      "artwork_data.art_id": artwork.art_id,
    }).lean()) as unknown as CreateOrderModelTypes;

    if (existingOrder && existingOrder.order_accepted.status !== "declined") {
      throw new ForbiddenError(
        "Order already exists and is being processed. Please wait."
      );
    }

    // Create order
    const createOrder: CreateOrderModelTypes = await CreateOrder.create({
      artwork_data: artwork,
      buyer_details: {
        name: buyerData.name,
        email: buyerData.email,
        id: buyerData.user_id,
        phone: buyerData.phone,
      },
      seller_details: {
        id: seller_id,
        name: sellerData.name,
        email: sellerData.email,
        phone: sellerData.phone,
      },
      seller_designation: designation,
      shipping_details: {
        addresses: {
          origin: sellerData.address,
          destination: shipping_address,
        },
        delivery_confirmed: false,
        shipment_information: {
          carrier: "DHL",
          tracking: { id: null, link: null, delivery_status: null },
        },
      },
      payment_information: { status: "pending" },
      order_accepted: { status: "", reason: "" },
    });

    if (save_shipping_address) {
      await AccountIndividual.updateOne(
        { user_id: buyer_id },
        { $set: { address: shipping_address } }
      );
    }

    // Fetch both device tokens in one go
    const deviceRecords = await DeviceManagement.find({
      auth_id: { $in: [buyer_id, seller_id] },
    })
      .select("auth_id device_push_token")
      .lean();

    const buyerToken = deviceRecords.find(
      (d) => d.auth_id === buyer_id
    )?.device_push_token;
    const sellerToken = deviceRecords.find(
      (d) => d.auth_id === seller_id
    )?.device_push_token;

    const notificationTasks: Promise<any>[] = [];

    if (buyerToken) {
      const buyerPayload: NotificationPayload = {
        to: buyerToken,
        title: "Order confirmed",
        body: "Your order request has been confirmed",
        data: {
          type: "orders",
          access_type: "collector",
          metadata: {
            orderId: createOrder.order_id,
            date: toUTCDate(new Date()),
          },
          userId: buyer_id,
        },
      };
      notificationTasks.push(
        createWorkflow(
          "/api/workflows/notification/pushNotification",
          `notif_buyer_${createOrder.order_id}_${generateDigit(2)}`,
          JSON.stringify(buyerPayload)
        )
      );
    }

    if (sellerToken) {
      const sellerPayload: NotificationPayload = {
        to: sellerToken,
        title: "New Order Request",
        body: "You have a new order request for your artwork",
        data: {
          type: "orders",
          access_type: designation as "gallery" | "artist",
          metadata: {
            orderId: createOrder.order_id,
            date: toUTCDate(new Date()),
          },
          userId: seller_id,
        },
      };
      notificationTasks.push(
        createWorkflow(
          "/api/workflows/notification/pushNotification",
          `notif_seller_${createOrder.order_id}_${generateDigit(2)}`,
          JSON.stringify(sellerPayload)
        )
      );
    }

    // Run all side effects concurrently
    const date = getCurrentDate();
    await Promise.all([
      sendOrderRequestToGalleryMail({
        name: sellerData.name,
        email: sellerData.email,
        buyer: buyerData.name,
        date,
        artwork_data: artwork,
      }),
      sendOrderRequestReceivedMail({
        name: buyerData.name,
        email: buyerData.email,
        artwork_data: artwork,
        orderId: createOrder.order_id,
      }),
      ...notificationTasks,
    ]);

    return NextResponse.json(
      { message: "Order created successfully" },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "order: create order",
      error,
      error_response.status
    );
    console.error("Order creation error:", error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
