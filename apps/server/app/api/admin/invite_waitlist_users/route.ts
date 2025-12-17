import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { CombinedConfig } from "@omenai/shared-types";
import { Resend } from "resend";
import { render } from "@react-email/render";
import InvitationEmail from "@omenai/shared-emails/src/views/admin/InvitationEmail";
import { inviteWaitlistUserValidator } from "./InviteWaitlistUserValidator";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};
const resend = new Resend(process.env.RESEND_API_KEY);

type WaitlistUserPayload = {
  waitlistId: string;
  discount: boolean;
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    const { waitlistUsers: selectedUsers } = await request.json();
    // validate payload
    inviteWaitlistUserValidator(selectedUsers);

    const waitlistIds = selectedUsers.map(
      (user: WaitlistUserPayload) => user.waitlistId
    );

    // Look for waitlist users in database
    const matchedUsers = await Waitlist.find({
      waitlistId: { $in: waitlistIds },
    }).lean();

    // Create a map for quick discount lookup
    const discountMap = new Map(
      selectedUsers.map((user: WaitlistUserPayload) => [
        user.waitlistId,
        user.discount,
      ])
    );

    // Bulk write operations
    const bulkOps = matchedUsers.map((user) => ({
      updateOne: {
        filter: { waitlistId: user.waitlistId },
        update: {
          $set: {
            isInvited: true,
            "discount.active": discountMap.get(user.waitlistId) || false,
          },
        },
      },
    }));

    // Execute bulk write
    const bulkResult = await Waitlist.bulkWrite(bulkOps);

    // Validate bulk write results
    const { modifiedCount } = bulkResult;
    const bulkErrors = bulkResult.getWriteErrors();

    // Determine successfully updated users
    let successfullyUpdatedUsers = [...matchedUsers];
    let failedUserIds: string[] = [];

    // Check for write errors from bulkWrite
    if (bulkErrors && bulkErrors.length > 0) {
      const errorDetails = bulkErrors.map((err) => ({
        index: err.index,
        code: err.code,
        message: err.errmsg,
        waitlistId: matchedUsers[err.index]?.waitlistId,
      }));

      createErrorRollbarReport(
        "admin: invite waitlist users - bulkWrite errors",
        new Error(
          `BulkWrite encountered ${bulkErrors.length} errors: ${JSON.stringify(errorDetails)}`
        ),
        500
      );

      // Extract failed waitlist IDs
      const failedIndices = new Set(bulkErrors.map((err) => err.index));
      const failedUsers = matchedUsers.filter((_, index) =>
        failedIndices.has(index)
      );
      failedUserIds = failedUsers.map((u) => u.waitlistId);

      // Remove failed users from successful list
      successfullyUpdatedUsers = matchedUsers.filter(
        (_, index) => !failedIndices.has(index)
      );
    }

    // Send emails only to successfully updated users
    if (successfullyUpdatedUsers.length > 0) {
      const inviteUserEmailPayload = await Promise.all(
        successfullyUpdatedUsers.map(async (user) => {
          const html = await render(
            InvitationEmail(
              user.name,
              user.inviteCode ?? "",
              user.email,
              user.entity
            )
          );
          return {
            from: "Onboarding <onboarding@omenai.app>",
            to: [user.email],
            subject: "Join Omenai: An Invitation for Your Gallery",
            html,
          };
        })
      );
      await resend.batch.send(inviteUserEmailPayload);
    }

    return NextResponse.json(
      {
        message: "Successfully invited waitlist users",
        modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: invite waitlist users",
      error,
      error_response?.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
