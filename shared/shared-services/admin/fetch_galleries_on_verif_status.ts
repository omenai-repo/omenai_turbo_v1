require("dotenv").config();

import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function fetchGalleriesOnVerifStatus(status: boolean) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `http://localhost:8080/api/admin/get_galleries_on_verif_status`,
      {
        method: "POST",
        body: JSON.stringify({ status }),
      }
    );

    const result = await res.json();
    console.log(result);

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
