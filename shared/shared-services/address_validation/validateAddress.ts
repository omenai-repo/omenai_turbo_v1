<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { getApiUrl } from "@omenai/url-config/src/config";

export async function validateAddress(payload: {
  type: "pickup" | "delivery";
  countryCode: string;
  postalCode: string;
  cityName: string;
  countyName: string;
}) {
  try {
    const url = getApiUrl();
    const result = await fetch(`${url}/api/shipment/address_validation`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await result.json();
    return { isOk: result.ok, message: response.message, data: response.data };
  } catch (error) {
    logRollbarServerError(error);
    return { isOk: false, message: "Something went wrong" };
  }
}
