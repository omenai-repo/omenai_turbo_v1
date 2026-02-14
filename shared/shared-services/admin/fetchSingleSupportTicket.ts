import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchSingleSupportTicket(id: string) {
  try {
    const res = await fetch(`${getApiUrl()}/api/admin/support/id?id=${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const response = await res.json();

    return {
      isOk: res.ok,
      data: response.data,
      success: response.success,
      message: response.message,
    };
  } catch (error) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
