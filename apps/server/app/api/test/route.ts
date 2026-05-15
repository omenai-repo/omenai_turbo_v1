import { sendTestMail } from "./../../../../../node_modules/@omenai/shared-emails/src/models/test/sendTestMail";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  CombinedConfig,
  DeepLinkPayload,
  SessionData,
} from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../util";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { encryptLinkData } from "@omenai/shared-utils/src/deeplinkCrypto";
import {
  base_url,
  deeplink_url,
  getApiUrl,
} from "@omenai/url-config/src/config";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const { email } = await request.json();
  const data: DeepLinkPayload = {
    role: "user",
    route: `${base_url()}/artwork/7c36104d-9d87-4ab1-b9c8-a75e8258dc8a`,
    payload: {
      page: "artwork",
    },
    params: {
      art_id: "7c36104d-9d87-4ab1-b9c8-a75e8258dc8a",
    },
  };

  const token = encryptLinkData(data);
  const redirectLink = `${deeplink_url()}?token=${token}`;
  try {
    await sendTestMail({
      name: "Test User",
      cta: redirectLink,
      email,
    });

    return NextResponse.json({ message: "Successful" });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
