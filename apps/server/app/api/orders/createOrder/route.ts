import { sendOrderRequestToGalleryMail } from "@omenai/shared-emails/src/models/orders/orderRequestToGallery";
import { sendOrderRequestReceivedMail } from "@omenai/shared-emails/src/models/orders/orderRequestReceived";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import {
  ServerError,
  ForbiddenError,
  BadRequestError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { getCurrentDate } from "@omenai/shared-utils/src/getCurrentDate";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import {
  AddressTypes,
  CombinedConfig,
  CreateOrderModelTypes,
  NotificationPayload,
} from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["user"],
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

    const buyerData = await AccountIndividual.findOne(
      { user_id: buyer_id },
      "name email user_id phone"
    ).exec();

    // Update seller data based on order designation
    let seller_data;

    if (designation === "gallery") {
      const gallery_data = await AccountGallery.findOne(
        { gallery_id: seller_id },
        "name email address phone"
      ).exec();
      seller_data = gallery_data;
    } else {
      const artist_data = await AccountArtist.findOne(
        { artist_id: seller_id },
        "name email phone address"
      ).exec();
      seller_data = artist_data;
    }

    const response = await fetch(
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

    const result = await response.json();

    if (!response.ok)
      throw new BadRequestError(
        result.message ||
          "Oops! We can't ship to this address just yet 🚫. Double-check your address or try a different one!"
      );

    const artwork = await Artworkuploads.findOne(
      { art_id },
      "title artist pricing url art_id availaility role_access exclusivity_status"
    ).exec();

    if (!buyerData || !artwork)
      throw new ServerError("An error was encountered. Please try again");

    const isOrderPresent = await CreateOrder.findOne({
      "buyer_details.email": buyerData.email,
      "artwork_data.art_id": artwork.art_id,
    });

    if (isOrderPresent && isOrderPresent.order_accepted.status !== "declined")
      throw new ForbiddenError(
        "Order already exists and is being processed, Please be patient."
      );
    else {
      const createOrder: CreateOrderModelTypes = await CreateOrder.create({
        artwork_data: artwork,
        buyer_details: {
          name: buyerData.name,
          email: buyerData.email,
          id: buyerData.user_id,
          phone: buyerData.phone,
        },
        shipping_details: {
          addresses: {
            origin: seller_data.address,
            destination: shipping_address,
          },
          delivery_confirmed: false,
          additional_information: "",
          shipment_information: {
            carrier: "DHL",
            shipment_product_code: "",

            dimensions: {
              length: 0,
              weight: 0,
              width: 0,
              height: 0,
            },
            pickup: {
              additional_information: "",
              pickup_max_time: "",
              pickup_min_time: "",
            },
            tracking: {
              id: null,
              link: null,
              delivery_status: null,
              delivery_date: null,
            },
            planned_shipping_date: "",
            estimates: {
              estimatedDeliveryDate: "",
              estimatedDeliveryType: "",
            },
            quote: {
              fees: "",
              taxes: "",
            },
            waybill_document: "",
          },
        },
        hold_status: null,
        exhibition_status: null,
        seller_details: {
          id: seller_id,
          name: seller_data.name,
          email: seller_data.email,
          phone: seller_data.phone,
        },
        seller_designation: designation,
        payment_information: {
          status: "pending",
          transaction_value: 0,
          transaction_date: "",
          transaction_reference: "",
        },
        order_accepted: {
          status: "",
          reason: "",
        },
      });

      if (!createOrder)
        throw new ServerError(
          "An error was encountered while creating this order. Please try again"
        );

      if (save_shipping_address) {
        await AccountIndividual.updateOne(
          { user_id: buyer_id },
          { $set: { address: shipping_address } }
        );
      }

      const buyer_push_token = await DeviceManagement.findOne(
        { auth_id: createOrder.buyer_details.id },
        "device_push_token"
      );
      const seller_push_token = await DeviceManagement.findOne(
        { auth_id: createOrder.seller_details.id },
        "device_push_token"
      );

      const notificationPromises = [];

      // Check for actual token value, not just document existence
      if (buyer_push_token?.device_push_token) {
        const buyer_notif_payload: NotificationPayload = {
          to: buyer_push_token.device_push_token, // Extract the actual token
          title: "Order confirmed",
          body: "Your order request has been confirmed",
          data: {
            type: "orders",
            access_type: "collector",
            metadata: {
              orderId: createOrder.order_id,
              date: toUTCDate(new Date()),
            },
            userId: createOrder.buyer_details.id,
          },
        };

        notificationPromises.push(
          createWorkflow(
            "/api/workflows/notification/pushNotification",
            `notification_workflow_buyer_${createOrder.order_id}_${generateDigit(2)}`,
            JSON.stringify(buyer_notif_payload)
          ).catch((error) => {
            console.error("Failed to send buyer notification:", error);
          })
        );
      }

      if (seller_push_token?.device_push_token) {
        const seller_notif_payload: NotificationPayload = {
          to: seller_push_token.device_push_token, // Extract the actual token
          title: "New Order request",
          body: "You have a new order request for your artwork", // Fixed typo
          data: {
            type: "orders",
            access_type: createOrder.seller_designation as "gallery" | "artist",
            metadata: {
              orderId: createOrder.order_id,
              date: toUTCDate(new Date()),
            },
            userId: createOrder.seller_details.id,
          },
        };

        notificationPromises.push(
          createWorkflow(
            "/api/workflows/notification/pushNotification",
            `notification_workflow_seller_${createOrder.order_id}_${generateDigit(2)}`,
            JSON.stringify(seller_notif_payload)
          ).catch((error) => {
            console.error("Failed to send seller notification:", error);
          })
        );
      }
      const date = getCurrentDate();
      await Promise.all([
        sendOrderRequestToGalleryMail({
          name: seller_data.name,
          email: seller_data.email,
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
        ...notificationPromises,
      ]);

      return NextResponse.json(
        {
          message: "Order created",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
