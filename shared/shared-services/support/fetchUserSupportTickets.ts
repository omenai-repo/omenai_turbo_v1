import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchUserSupportTickets(params: any) {
  try {
    const response = await fetch(
      `${getApiUrl()}/api/support/fetchUserTickets?${params.toString()}`,
    );

    const result = await response.json();

    return {
      isOk: response.ok,
      data: result.data,
      message: result.message,
      pagination: result.pagination,
      success: result.success,
    };
  } catch (error) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
