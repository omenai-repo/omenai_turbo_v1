import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { CombinedConfig } from "@omenai/shared-types";
import { Resend } from "resend";
import { render } from "@react-email/render";
import InvitationEmail from "@omenai/shared-emails/src/views/admin/InvitationEmail";

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

    // validation
    if (!selectedUsers) {
      throw new BadRequestError("waitlistUsers field is required");
    }

    if (!Array.isArray(selectedUsers)) {
      throw new BadRequestError("waitlistUsers must be an array");
    }

    if (selectedUsers.length === 0) {
      throw new BadRequestError("waitlistUsers array cannot be empty");
    }

    // Validate each user object
    for (let i = 0; i < selectedUsers.length; i++) {
      const user = selectedUsers[i];

      if (!user || typeof user !== "object") {
        throw new BadRequestError(
          `Invalid user object at index ${i}: must be an object`
        );
      }

      if (!user.waitlistId || typeof user.waitlistId !== "string") {
        throw new BadRequestError(
          `Invalid or missing waitlistId at index ${i}: must be a non-empty string`
        );
      }

      if (user.waitlistId.trim().length === 0) {
        throw new BadRequestError(
          `Invalid waitlistId at index ${i}: cannot be empty or whitespace`
        );
      }

      if (typeof user.discount !== "boolean") {
        throw new BadRequestError(
          `Invalid discount value at index ${i}: must be a boolean`
        );
      }
    }

    // Check for duplicate waitlistIds
    const waitlistIds = selectedUsers.map(
      (user: WaitlistUserPayload) => user.waitlistId
    );
    const duplicates = waitlistIds.filter(
      (id, index) => waitlistIds.indexOf(id) !== index
    );

    if (duplicates.length > 0) {
      throw new BadRequestError(
        `Duplicate waitlistIds found: ${[...new Set(duplicates)].join(", ")}`
      );
    }

    // Look for waitlist users in database
    const waitlistUsers = await Waitlist.find({
      waitlistId: { $in: waitlistIds },
    }).lean();

    // Verify all requested users exist
    if (waitlistUsers.length !== selectedUsers.length) {
      const foundIds = waitlistUsers.map((u) => u.waitlistId);
      const missingIds = waitlistIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestError(
        `Waitlist users not found: ${missingIds.join(", ")}`
      );
    }

    // Send email to each waitlist user
    const inviteUserEmailPayload = await Promise.all(
      waitlistUsers.map(async (user) => {
        const html = await render(
          InvitationEmail(
            user.name,
            user.inviteCode ?? "",
            user.email,
            user.entity
          )
        );
        return {
          from: "Team <omenai@omenai.app>",
          to: [user.email],
          subject: "You've been personally invited to join Omenai",
          html,
        };
      })
    );
    await resend.batch.send(inviteUserEmailPayload);

    // Create a map for quick discount lookup
    const discountMap = new Map(
      selectedUsers.map((user: WaitlistUserPayload) => [
        user.waitlistId,
        user.discount,
      ])
    );

    // Bulk write operations
    const bulkOps = waitlistUsers.map((user) => ({
      updateOne: {
        filter: { waitlistId: user.waitlistId },
        update: {
          $set: {
            isInvited: true,
            discount: {
              active: discountMap.get(user.waitlistId) || false,
            },
          },
        },
      },
    }));

    // Execute bulk write
    await Waitlist.bulkWrite(bulkOps);

    return NextResponse.json(
      {
        message: "Successfully invited waitlist users",
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
