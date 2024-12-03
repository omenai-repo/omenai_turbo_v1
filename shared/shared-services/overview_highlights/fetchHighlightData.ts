import { getArtworkHighlightData } from "./getArtworkHighlightData.ts";
import { getImpressionHighlightData } from "./getImpressionHighlightData.ts";
import { getSalesHighlightData } from "./getSalesHighlightData.ts";
import { getSubscriptionHighlightData } from "./getSubscriptionHighlightData.ts";

export async function fetchHighlightData(
  tag: string,
  session_id: string,
  sub_active: boolean
) {
  if (tag === "artworks") {
    const result = await getArtworkHighlightData(session_id);
    return result.data.length;
  }

  if (tag === "impressions") {
    const impressions = await getImpressionHighlightData(session_id);

    const impression_count = impressions.data.reduce(
      (acc: any, current: any) => acc + current.impressions,
      0
    );
    return impression_count;
  }

  if (tag === "subscription") {
    const result = await getSubscriptionHighlightData(sub_active);
    return result;
  }

  if (tag === "sales") {
    const result = await getSalesHighlightData(session_id);
    return result.data.length;
  }
}
