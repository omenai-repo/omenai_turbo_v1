import {logRollbarServerError} from "@omenai/rollbar-config"
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchWalletTransactions(
  id: string,
  year: string,
  page: string,
  limit?: string | null,
  status?: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/wallet/fetch_wallet_transactions?id=${id}&year=${year}&limit=${limit}&status=${status}&page=${page}`,
      {
        method: "GET",
      }
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
      pageCount: result.pageCount,
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
