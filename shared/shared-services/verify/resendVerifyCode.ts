import { getApiUrl } from "@omenai/url-config/src/config";
import { toast } from "sonner";

export async function resendCode(
  route: "individual" | "gallery",
  payload: { author: string }
) {
  try {
    const url = getApiUrl();

    await fetch(`${url}/api/requests/${route}/verify/resend`, {
      method: "POST",
      body: JSON.stringify({ author: payload.author }),
      headers: {
        "Content-type": "application/json",
      },
    }).then(async (res) => {
      const response: { isOk: boolean; body: { message: string } } = {
        isOk: res.ok,
        body: await res.json(),
      };

      if (!res.ok) {
        toast.error("Error notification", {
          description: response.body.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      } else {
        toast.success("Operation successful", {
          description: response.body.message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
      }
    });
  } catch (error: any) {
    console.log(error);
  }
}
