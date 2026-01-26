import { getApiUrl } from "@omenai/url-config/src/config";

export async function patchSupportTicket(id: string, updates: any) {
  try {
    const res = await fetch(`${getApiUrl()}/api/admin/support/patch?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
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
