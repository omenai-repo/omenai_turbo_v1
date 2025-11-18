import { rollbarServerInstance } from "@omenai/rollbar-config";
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
    if (error instanceof Error) {
      rollbarServerInstance.error(error);
    } else {
      // Wrap non-Error objects in an Error
      rollbarServerInstance.error(new Error(String(error)));
    }
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
