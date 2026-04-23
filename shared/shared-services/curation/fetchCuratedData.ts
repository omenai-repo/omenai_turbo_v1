import { CurationTypes } from "@omenai/shared-types";

import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchCurationData(
  curation_type: CurationTypes["curation_type"],
) {
  const url = getApiUrl();
  try {
    const response = await fetch(`${url}/api/curation?type=${curation_type}`, {
      method: "GET",
    });

    const result = await response.json();

    return {
      isOk: response.ok,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
