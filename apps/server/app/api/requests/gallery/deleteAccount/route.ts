import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig, DeletionRequestBody } from "@omenai/shared-types";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import {
  createDeletionRequestAndRespond,
  DeletionCommitmentResult,
  generateDeletionCommitments,
  hasActiveStripeBalance,
} from "../../utils";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};

export const DELETE = withRateLimitHighlightAndCsrf(config)(
  async function DELETE(request: Request) {
    try {
      await connectMongoDB();
      const { id, reason }: DeletionRequestBody = await request.json();

      const galleryAccount = await AccountGallery.findOne(
        { gallery_id: id },
        "stripe_connected_account_id"
      );

      if (!galleryAccount) {
        throw new NotFoundError("Gallery account not found");
      }

      const checkActiveDeletionRequest = await DeletionRequestModel.findOne({
        targetId: galleryAccount.gallery_id,
        status: { $in: ["requested", "in_progress"] },
      });

      if (checkActiveDeletionRequest) {
        throw new ForbiddenError(
          "An active deletion request already exists for this account."
        );
      }
      const order = await CreateOrder.findOne(
        {
          "seller_details.id": id,
          status: "processing",
          "order_accepted.status": "accepted",
        },
        "payment_information"
      );

      const subscription = await Subscriptions.findOne(
        {
          "customer.gallery_id": id,
          status: { $in: ["active", "expired"] },
        },
        "stripe_customer_id"
      );

      const hasBalance = await hasActiveStripeBalance(
        galleryAccount.stripe_connected_account_id
      );

      const commitments: DeletionCommitmentResult = generateDeletionCommitments(
        {
          hasActiveOrder: !!order,
          hasActiveSubscription: !!subscription,
          hasUnpaidStripeBalance: hasBalance.isBalance,
        }
      );

      if (!commitments.can_delete) {
        return NextResponse.json(
          {
            message: "Account deletion blocked due to active commitments",
            can_delete: false,
            commitments,
            balance: hasBalance.balance.available,
          },
          { status: 409 }
        );
      }

      const gracePeriodEnd = await createDeletionRequestAndRespond({
        targetId: id,
        reason,
        entityType: "gallery",
      });

      return NextResponse.json(
        {
          message: "Account deletion initiated",
          can_delete: true,
          gracePeriodEnd,
        },
        { status: 202 }
      );
    } catch (error) {
      console.log(error);
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
