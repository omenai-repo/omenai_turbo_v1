import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchViewHistory(user_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/viewHistory/getViewHistory`, {
      method: "POST",

      body: JSON.stringify({ user_id }),
    });

    const result = await res.json();
    return { isOk: res.ok, data: result.data, message: result.message };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
