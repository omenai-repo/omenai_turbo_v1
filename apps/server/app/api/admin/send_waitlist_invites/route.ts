import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CombinedConfig, IWaitlistLead } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { sendWaitlistInviteValidator } from "./sendWaitlistInviteValidator";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";
import SendWaitListInvites from "@omenai/shared-emails/src/views/admin/SendWaitListInvites";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};
const resend = new Resend(process.env.RESEND_API_KEY);
type Payload = {
  name: string;
  email: string;
  entity: string;
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();
    const { selectedUsers } = (await request.json()) as {
      selectedUsers: Payload[];
    };
    sendWaitlistInviteValidator(selectedUsers);

    const userEmails = selectedUsers.map((user) => user.email);
    const matchedUsers = (await WaitlistLead.find({
      email: { $in: userEmails },
    }).lean()) as unknown as IWaitlistLead[];

     const inviteUserEmailPayload = await Promise.all(
       matchedUsers.map(async (user) => {
         const html = await render(
           SendWaitListInvites(user.name, user.email, user.entity),
         );
         return {
           from: "Onboarding <onboarding@omenai.app>",
           to: [user.email],
           subject: "Join Omenai: An Invitation for Your Gallery",
           html,
         };
       }),
     );
    await resend.batch.send(inviteUserEmailPayload);

    return NextResponse.json(
      { success: true, message: "Successfully invited waitlist users" },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: send waitlist invites",
      error,
      error_response?.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
