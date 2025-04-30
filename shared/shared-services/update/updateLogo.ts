import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateLogo(payload: {
  id: string;
  url: string;
  route: "gallery" | "artist";
}) {
  const url = getApiUrl();

  const result = await fetch(`${url}/api/requests/${payload.route}/logo`, {
    method: "POST",
    body: JSON.stringify({ ...payload }),
    headers: {
      "Content-type": "application/json",
    },
  }).then(async (res) => {
    const data: { message: string } = await res.json();
    const response = {
      isOk: res.ok,
      body: { message: data.message },
    };

    return response;
  });

  return result;
}
