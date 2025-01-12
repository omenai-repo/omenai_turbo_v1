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
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { getCurrentDate } from "@omenai/shared-utils/src/getCurrentDate";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { CreateOrderModelTypes } from "@omenai/shared-types";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const {
      buyer_id,
      art_id,
      seller_id,
      save_shipping_address,
      shipping_address,
      origin_address,
      designation,
    } = await request.json();
    console.log(
      buyer_id,
      art_id,
      seller_id,
      save_shipping_address,
      shipping_address,
      origin_address,
      designation
    );

    const buyerData = await AccountIndividual.findOne(
      { user_id: buyer_id },
      "name email user_id"
    ).exec();

    // Update seller data based on order designation
    let seller_data;

    if (designation === "gallery") {
      const gallery_data = await AccountGallery.findOne(
        { gallery_id: seller_id },
        "name email"
      ).exec();
      seller_data = gallery_data;
    } else {
      const artist_data = await AccountArtist.findOne(
        { artist_id: seller_id },
        "name, email"
      ).exec();
      seller_data = artist_data;
    }

    const artwork = await Artworkuploads.findOne(
      { art_id },
      "title artist pricing url art_id availaility"
    ).exec();

    if (!buyerData || !artwork)
      throw new ServerError("An error was encountered. Please try again");

    const isOrderPresent = await CreateOrder.findOne({
      "buyer_details.email": buyerData.email,
      "artwork_data.art_id": artwork.art_id,
    });

    if (isOrderPresent)
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
        },
        shipping_details: {
          addresses: {
            origin: origin_address,
            destination: shipping_address,
          },
          tracking: {
            id: "",
            link: "",
          },
          quote: {
            package_carrier: "",
            fees: "",
            taxes: "",
            additional_information: "",
          },
          delivery_confirmed: false,
        },
        seller_details: {
          id: seller_id,
          name: seller_data.name,
          email: seller_data.email,
        },
        payment_information: {
          status: "pending",
          transaction_value: "",
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

      const date = getCurrentDate();
      await sendOrderRequestToGalleryMail({
        name: seller_data.name,
        email: seller_data.email,
        buyer: buyerData.name,
        date,
        artwork_data: artwork,
      });

      await sendOrderRequestReceivedMail({
        name: buyerData.name,
        email: buyerData.email,
        artwork_data: artwork,
      });

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
}
