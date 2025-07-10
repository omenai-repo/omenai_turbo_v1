import { WithdrawalAccount } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function addPrimaryAccount({
  owner_id,
  account_details,
  base_currency,
  token,
}: {
  owner_id: string;
  account_details: Omit<WithdrawalAccount, "beneficiary_id">;
  base_currency: string;
  token: string;
}) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/wallet/add_primary_account`, {
      method: "POST",
      body: JSON.stringify({ owner_id, account_details, base_currency }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
    };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
