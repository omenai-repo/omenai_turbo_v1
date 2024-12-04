import { getApiUrl } from "@omenai/url-config/src/config";

export const releaseOrderLock = async (art_id: string, user_id: string) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/locks/releaseLock`, {
      method: "POST",
      body: JSON.stringify({
        art_id,
        user_id,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
};
