import { getApiUrl } from "@omenai/url-config/src/config";

export async function retrieveSubscriptionData(
  gallery_id: string,
  token: string
) {
  try {
    const url = getApiUrl();

    const res = await fetch(`${url}/api/subscriptions/retrieveSubData`, {
      method: "POST",
      body: JSON.stringify({ gallery_id }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });
    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
      plan: result.plan,
    };
  } catch (error) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
