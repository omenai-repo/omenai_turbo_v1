import { CurationTypes } from "@omenai/shared-types";

import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function saveCurationDraft(
  curation_type: CurationTypes["curation_type"],
  draft_items: CurationTypes["draft_items"],
  token: string,
) {
  const url = getApiUrl();
  try {
    const response = await fetch(`${url}/api/admin/saveDraft`, {
      method: "POST",
      headers: {
        "x-csrf-token": token,
      },
      credentials: "include",
      body: JSON.stringify({ curation_type, draft_items }),
    });

    const result = await response.json();

    return { isOk: response.ok, message: result.message, data: result.data };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
