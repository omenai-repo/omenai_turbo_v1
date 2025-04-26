import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { getArtworkHighlightData } from "../getArtworkHighlightData";
import { getSalesHighlightData } from "../getSalesHighlightData";
import { fetchIncomeData } from "./fetchIncomeData";
import { fetchWalletBalance } from "./fetchWalletBalance";

export async function fetchHighlightData(tag: string, session_id: string) {
  if (tag === "net") {
    const result = await fetchIncomeData(session_id);
    console.log(result);
    return result?.isOk ? formatPrice(result.data.netIncome) : formatPrice(0);
  }
  if (tag === "revenue") {
    const result = await fetchIncomeData(session_id);
    console.log(result);
    return result?.isOk
      ? formatPrice(result.data.salesRevenue)
      : formatPrice(0);
  }

  if (tag === "balance") {
    const result = await fetchWalletBalance(session_id);
    return result?.isOk ? formatPrice(result.data.available) : formatPrice(0);
  }

  if (tag === "artworks") {
    const result = await getArtworkHighlightData(session_id);
    return result?.isOk ? result.count : 0;
  }

  if (tag === "sales") {
    const result = await getSalesHighlightData(session_id);
    return result?.isOk ? result.count : 0;
  }
}
