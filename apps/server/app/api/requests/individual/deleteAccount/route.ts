import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { CombinedConfig, SessionData } from "@omenai/shared-types";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import {
  createDeletionRequestAndRespond,
  generateDeletionCommitments,
} from "../../utils";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { hashEmail } from "@omenai/shared-lib/encryption/encrypt_email";
import { createErrorRollbarReport } from "../../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["user"],
};

export const DELETE = withRateLimitHighlightAndCsrf(config)(
  async function DELETE(request: Request) {
    try {
      await connectMongoDB();
      const { id, reason } = await request.json();

      if (!id || !reason) {
        throw new BadRequestError(
          "Missing parameters, No ID or Reason provided"
        );
      }

      const collectorAccount = await AccountIndividual.findOne(
        { user_id: id },
        "user_id email"
      );

      if (!collectorAccount) {
        throw new NotFoundError("Collector account not found");
      }

      const checkActiveDeletionRequest = await DeletionRequestModel.findOne({
        targetId: collectorAccount.user_id,
        status: { $in: ["requested", "in_progress"] },
      });

      if (checkActiveDeletionRequest) {
        throw new ForbiddenError(
          "An active deletion request already exists for this account."
        );
      }

      const order = await CreateOrder.findOne(
        {
          "buyer_details.id": id,
          status: "processing",
          "order_accepted.status": "accepted",
          "payment_information.status": { $nin: ["pending", "failed"] },
        },
        "payment_information"
      );

      const commitments = generateDeletionCommitments({
        hasActiveOrder: !!order,
      });

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

      const hashTargetEmail = hashEmail(collectorAccount.email);

      if (!hashTargetEmail)
        throw new ServerError(
          "Unable to create an Account deletion request at this time, please contact support"
        );

      const gracePeriodEnd = await createDeletionRequestAndRespond({
        targetId: id,
        reason,
        entityType: "user",
        email: hashTargetEmail,
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
      console.error(error);
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "individual: delete count",
        error as any,
        error_response.status
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
