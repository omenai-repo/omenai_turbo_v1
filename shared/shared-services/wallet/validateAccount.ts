import { getApiUrl } from "@omenai/url-config/src/config";

export async function validateBankAccount(
  bankCode: string,
  accountNumber: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/wallet/accounts/validate_account`, {
      method: "POST",
      body: JSON.stringify({ bankCode, accountNumber }),
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.account_data,
    };
  } catch (error: any) {
    console.log(error);
  }
}
