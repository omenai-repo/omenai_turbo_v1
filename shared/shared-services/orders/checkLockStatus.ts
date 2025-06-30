import { getApiUrl } from "@omenai/url-config/src/config";

export const checkLockStatus = async (art_id: string, user_id: string) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/locks/checkLock`, {
      method: "POST",
      body: JSON.stringify({
        art_id,
        user_id,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
};
