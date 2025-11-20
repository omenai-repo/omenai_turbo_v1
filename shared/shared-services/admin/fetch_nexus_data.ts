<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { NexusDocument } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchNexusData(code: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/get_nexus_data?code=${code}`, {
      method: "GET",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data as NexusDocument,
    };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
