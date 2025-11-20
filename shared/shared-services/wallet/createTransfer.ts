<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import { logRollbarServerError } from "@omenai/rollbar-config";
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { WithdrawalAccount } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createTransfer({
  amount,
  wallet_id,
  wallet_pin,
  token,
}: {
  amount: number;
  wallet_id: string;
  wallet_pin: string;
  token: string;
}) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/flw/createTransfer`, {
      method: "POST",
      body: JSON.stringify({
        amount,
        wallet_id,
        wallet_pin,
      }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.account_data,
    };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
