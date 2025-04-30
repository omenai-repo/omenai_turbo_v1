import { getApiUrl } from "@omenai/url-config/src/config";

export async function getBankBranches(bankCode: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/wallet/accounts/get_bank_branches?bankCode=${bankCode}`,
      {
        method: "GET",
      }
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.bank_branches,
    };
  } catch (error: any) {
    console.log(error);
  }
}
