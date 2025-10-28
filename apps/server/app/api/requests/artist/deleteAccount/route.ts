import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig, DeletionRequestBody } from "@omenai/shared-types";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import {
  createDeletionRequestAndRespond,
  DeletionCommitmentResult,
  generateDeletionCommitments,
  hasFinancialCommitments,
} from "../../utils";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};
export const DELETE = withRateLimitHighlightAndCsrf(config)(
  async function DELETE(request: Request) {
    try {
      await connectMongoDB();
      const { id, reason }: DeletionRequestBody = await request.json();

      if (!id || !reason) {
        throw new BadRequestError(
          "Missing parameters, No ID or Reason provided"
        );
      }

      const artistAccount = await AccountArtist.findOne(
        { artist_id: id },
        "wallet_id artist_id"
      );

      if (!artistAccount) {
        throw new NotFoundError("Artist account not found");
      }

      const checkActiveDeletionRequest = await DeletionRequestModel.findOne({
        targetId: artistAccount.artist_id,
        status: { $in: ["requested", "in_progress"] },
      });

      if (checkActiveDeletionRequest) {
        throw new ForbiddenError(
          "An active deletion request already exists for this account."
        );
      }
      // Check for active orders where the artist is the seller
      const order = await CreateOrder.findOne(
        {
          "seller_details.id": id,
          status: "processing",
          "order_accepted.status": "accepted",
        },
        "payment_information"
      );

      const { hasPendingTransactions, hasPositiveBalance } =
        await hasFinancialCommitments(artistAccount.wallet_id);

      const commitments: DeletionCommitmentResult = generateDeletionCommitments(
        {
          hasActiveOrder: !!order,
          hasPendingWithdrawal: hasPendingTransactions,
          hasUnpaidWalletBalance: hasPositiveBalance,
        }
      );

      if (!commitments.can_delete) {
        return NextResponse.json(
          {
            message: "Account deletion blocked due to active commitments",
            can_delete: false,
            commitments,
          },
          { status: 409 }
        );
      }

      const gracePeriodEnd = await createDeletionRequestAndRespond({
        targetId: id,
        reason,
        entityType: "artist",
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
