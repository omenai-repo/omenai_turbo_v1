import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function verifyEmail(
  payload: { params: string; token: string },
  route: "gallery" | "individual"
) {
  const url = getApiUrl();

  const result = await fetch(`${url}/api/requests/${route}/verifyMail`, {
    method: "POST",
    body: JSON.stringify({ params: payload.params, token: payload.token }),
    headers: {
      "Content-type": "application/json",
    },
  }).then(async (res) => {
    const response = {
      isOk: res.ok,
      body: await res.json(),
    };

    return response;
  });

  return result;
}
