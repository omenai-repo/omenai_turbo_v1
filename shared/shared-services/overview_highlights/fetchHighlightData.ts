import { getArtworkHighlightData } from "./getArtworkHighlightData";
import { getImpressionHighlightData } from "./getImpressionHighlightData";
import { getSalesHighlightData } from "./getSalesHighlightData";
import { getSubscriptionHighlightData } from "./getSubscriptionHighlightData";

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
