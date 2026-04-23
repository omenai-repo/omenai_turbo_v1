import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchCurationData(
  type: string,
  page: number,
  search: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/admin/fetch_curation_data?page=${page}&type=${type}&search=${search}`,
      {
        method: "GET",
      },
    );

    const result = await res.json();

    return { isOk: res.ok, data: result.data, pagination: result.pagination };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
