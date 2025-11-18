import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function requestPrice(
  data: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url" | "medium"
  >,
  email: string,
  name: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/requests/pricing/requestPrice`, {
      method: "POST",
      body: JSON.stringify({ data, email, name }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, status: res.status };
  } catch (error: any) {
    LogRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
