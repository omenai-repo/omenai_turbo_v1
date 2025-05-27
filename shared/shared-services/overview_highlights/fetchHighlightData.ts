import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { fetchIncomeData } from "./fetchIncomeData";
import { getArtworkHighlightData } from "./getArtworkHighlightData";
import { getSalesHighlightData } from "./getSalesHighlightData";

export async function fetchHighlightData(tag: string, session_id: string) {
  if (tag === "artworks") {
    const result = await getArtworkHighlightData(session_id);
    return result?.isOk ? result.count : 0;
  }
  if (tag === "net") {
    const result = await fetchIncomeData(session_id, "gallery");
    console.log(result);
    return result?.isOk
      ? formatPrice(result.data.netIncome, "USD")
      : formatPrice(0, "USD");
  }
  if (tag === "revenue") {
    const result = await fetchIncomeData(session_id, "gallery");
    return result?.isOk
      ? formatPrice(result.data.salesRevenue, "USD")
      : formatPrice(0, "USD");
  }

  if (tag === "sales") {
    const result = await getSalesHighlightData(session_id);
    return result?.isOk ? result.count : 0;
  }
}
