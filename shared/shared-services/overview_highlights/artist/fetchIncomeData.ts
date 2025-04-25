import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchIncomeData(session_id: string) {
  try {
    const url = getApiUrl();
    const response = await fetch(
      `${url}/api/requests/artist/fetchIncomeData?id=${session_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const result = await response.json();
    return { isOk: response.ok, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
