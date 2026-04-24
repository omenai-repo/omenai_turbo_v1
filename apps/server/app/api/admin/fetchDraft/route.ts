import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { CurationTypes } from "@omenai/shared-types";
import { Curation } from "@omenai/shared-models/models/curation/CurationSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { fetchArtworksFromCache } from "../../artworks/utils";
import {
  serverDatabases,
  sQuery,
} from "@omenai/appwrite-config/serverAppwrite";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const databaseId = process.env.APPWRITE_EDITORIAL_DATABASE_ID!;
const tableId = process.env.APPWRITE_EDITORIAL_COLLECTION_ID!;

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  try {
    const { searchParams } = new URL(request.url);
    const curation_type = searchParams.get("type");

    if (!curation_type) {
      throw new Error("Curation type query parameter is required");
    }
    await connectMongoDB();

    // 1. Fetch the raw draft pointers
    const curation = (await Curation.findOne({
      curation_type,
    }).lean()) as unknown as CurationTypes;

    if (
      !curation ||
      !curation.draft_items ||
      curation.draft_items.length === 0
    ) {
      return NextResponse.json({ data: [] });
    }

    const draftItems = curation.draft_items;

    // 2. Group identifiers by type for parallel fetching
    const groupedIds: Record<string, string[]> = {
      artwork: [],
      gallery: [],
      events: [],
      article: [],
      promotionals: [],
    };

    draftItems.forEach((item: { type: string; identifier: string }) => {
      if (groupedIds[item.type]) {
        groupedIds[item.type].push(item.identifier);
      }
    });

    const [
      artworksData,
      galleriesData,
      eventsData,
      articlesData,
      promotionalsData,
    ] = await Promise.all([
      // Artworks (Assuming Redis cache might have heavy objects, we map it down just in case)
      groupedIds.artwork.length > 0
        ? fetchArtworksFromCache(groupedIds.artwork).then((artworks: any[]) =>
            artworks.map((a) => ({
              art_id: a.art_id,
              title: a.title,
              artist: a.artist,
              url: a.url,
              medium: a.medium,
              year: a.year,
            })),
          )
        : Promise.resolve([]),

      // Galleries: Explicitly exclude _id, include only public UI fields
      groupedIds.gallery.length > 0
        ? AccountGallery.find({
            gallery_id: { $in: groupedIds.gallery },
          })
            .select("gallery_id name logo -_id")
            .lean()
        : Promise.resolve([]),

      // Events: Exclude _id, include only public UI fields
      groupedIds.events.length > 0
        ? GalleryEvent.find({ event_id: { $in: groupedIds.events } })
            .select(
              "event_id title cover_image start_date end_date location -_id",
            )
            .lean()
        : Promise.resolve([]),

      // Articles: Appwrite explicit selection
      groupedIds.article.length > 0
        ? serverDatabases
            .listRows({
              databaseId,
              tableId,
              queries: [
                sQuery.equal("slug", groupedIds.article),
                sQuery.select(["slug", "headline", "cover"]),
              ],
              total: false,
            })
            .then((response: any) => response.rows)
        : Promise.resolve([]),

      // Promotionals: Keep only the display fields
      groupedIds.promotionals.length > 0
        ? PromotionalModel.find({ _id: { $in: groupedIds.promotionals } })
            .select("headline subheadline image cta")
            .lean()
        : Promise.resolve([]),
    ]);

    // 4. Create lookup maps for fast O(1) assembly
    const dataMap = {
      artwork: new Map(artworksData.map((a: any) => [a.art_id, a])),
      gallery: new Map(galleriesData.map((g: any) => [g.gallery_id, g])),
      events: new Map(eventsData.map((e: any) => [e.event_id, e])),
      article: new Map(articlesData.map((a: any) => [a.slug, a])),
      promotionals: new Map(
        promotionalsData.map((p: any) => [p._id.toString(), p]),
      ),
    };

    // 5. Assemble the final hydrated payload, flagging missing data for Tombstones
    const hydratedDraftItems = draftItems.map((item) => {
      const entityData = dataMap[item.type as keyof typeof dataMap]?.get(
        item.identifier,
      );

      return {
        type: item.type,
        identifier: item.identifier,
        data: entityData || null,
        isMissingData: !entityData, // Flags this true if the db item was deleted
      };
    });

    return NextResponse.json({
      data: hydratedDraftItems,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "curation: fetch draft",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
