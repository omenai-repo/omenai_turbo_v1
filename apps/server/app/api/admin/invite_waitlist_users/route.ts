import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { CombinedConfig, WaitListTypes } from "@omenai/shared-types";
import { Resend } from "resend";
import { render } from "@react-email/render";
import InvitationEmail from "@omenai/shared-emails/src/views/admin/InvitationEmail";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};
const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = withRateLimitHighlightAndCsrf(config)(async function GET(
  request: Request
) {
  try {
    const { waitlistUsers: selectedUsers } = await request.json();
    // validate payload
    if (!selectedUsers || selectedUsers.length === 0)
      throw new BadRequestError("An array of waitlist user is required");
    // retrieve ids of waitlist payload
    const waitlistUserIds: string[] = selectedUsers.map(
      (waitlistUser: WaitListTypes) => waitlistUser.waitlistId
    );
    // look for id in database
    const waitlistUsers: WaitListTypes[] = await Waitlist.find({
      waitlistId: { $in: waitlistUserIds },
    });
    // send email
    const inviteUserEmailPayload = await Promise.all(
      waitlistUsers.map(async (user) => {
        const html = await render(
          InvitationEmail(user.name, user.inviteCode!, user.email, user.entity)
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
    // update waitlis users
    for (const waitlistUser of waitlistUsers) {
      const [selectedUser] = selectedUsers.filter(
        (user: WaitListTypes) => user.waitlistId === waitlistUser.waitlistId
      );
      await Waitlist.updateOne(
        { waitlistId: waitlistUser.waitlistId },
        {
          isInvited: true,
          discount: { active: selectedUser.discount.active },
        }
      );
    }

    return NextResponse.json(
      {
        message: "Successfully fetched all waitlist users",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: fetch waitlist user",
      error,
      error_response?.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
