import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import {
  Curation,
  CurationHistory,
} from "@omenai/shared-models/models/curation/CurationSchema";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
// ADDED PromotionalModel import
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import {
  AccountAdminSchemaTypes,
  CombinedConfig,
  CurationTypes,
  GalleryEventType,
  GallerySchemaTypes,
  SessionData,
} from "@omenai/shared-types";
import { redis } from "@omenai/upstash-config";
import { NextResponse } from "next/server";

// Appwrite SDK Setup
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { fetchArtworksFromCache } from "../../artworks/utils";
import { createErrorRollbarReport } from "../../util";
import {
  serverDatabases,
  sQuery,
} from "@omenai/appwrite-config/serverAppwrite"; // ADDED sQuery here
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["admin"],
};

const databaseId = process.env.APPWRITE_EDITORIAL_DATABASE_ID!;
const tableId = process.env.APPWRITE_EDITORIAL_COLLECTION_ID!;

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
  _?: Response | NextResponse<unknown>,
  session?: SessionData & { csrfToken: string },
) {
  try {
    const body = await request.json();
    const { curation_type } = body;
    const sessionnData = session?.userData as Omit<
      AccountAdminSchemaTypes,
      "password" | "phone" | "registeration_tracking"
    >;
    const admin_id = sessionnData.admin_id;

    if (!curation_type) {
      throw new Error("Curation type is required");
    }
    await connectMongoDB();
    // 1. Fetch current draft
    const curationDoc = (await Curation.findOne({
      curation_type,
    }).lean()) as unknown as CurationTypes;

    if (
      !curationDoc ||
      !curationDoc.draft_items ||
      curationDoc.draft_items.length === 0
    ) {
      throw new Error("No draft items found to publish");
    }

    const draftItems = curationDoc.draft_items;

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

    // 3. Fire parallel queries
    const [
      artworksData,
      galleriesData,
      eventsData,
      articlesData,
      promotionalsData,
    ] = await Promise.all([
      // Artworks via Redis wrapper
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

      // Galleries via MongoDB
      groupedIds.gallery.length > 0
        ? (AccountGallery.find({
            gallery_id: { $in: groupedIds.gallery },
          })
            .select("gallery_id name logo -_id")
            .lean() as unknown as GallerySchemaTypes[])
        : Promise.resolve([]),

      // Events via MongoDB
      groupedIds.events.length > 0
        ? (GalleryEvent.find({
            event_id: { $in: groupedIds.events },
          })
            .select(
              "event_id title cover_image start_date end_date location -_id",
            )
            .lean() as unknown as GalleryEventType[])
        : Promise.resolve([]),

      // Articles via Appwrite
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
            .then((response: any) =>
              response.rows.map(
                (row: any) =>
                  row as {
                    headline: string;
                    cover?: string;
                    date: string;
                    slug: string;
                    [key: string]: any;
                  },
              ),
            )
        : Promise.resolve([]),

      // Promotionals via MongoDB
      groupedIds.promotionals.length > 0
        ? PromotionalModel.find({
            _id: { $in: groupedIds.promotionals },
          })
            .select("headline subheadline image cta")
            .lean()
        : Promise.resolve([]),
    ]);

    // Create lookup maps for $O(1) assembly
    const dataMap = {
      artwork: new Map(artworksData.map((a: any) => [a.art_id, a])),
      gallery: new Map(galleriesData.map((g: any) => [g.gallery_id, g])),
      events: new Map(eventsData.map((e: any) => [e.event_id, e])),
      article: new Map(articlesData.map((a: any) => [a.slug, a])), // FIXED: Use slug instead of $id to match identifier
      promotionals: new Map(
        promotionalsData.map((p: any) => [p._id.toString(), p]),
      ), // Mapped ObjectId to string
    };

    // 4. Assemble payload & filter out missing data (Tombstone safeguard)
    const aggregatedPayload: Array<{ type: string; data: any }> = [];
    const validPublishedItems: Array<{ type: string; identifier: string }> = [];
    let removedItemsCount = 0;

    for (const item of draftItems) {
      const entityData = dataMap[item.type as keyof typeof dataMap]?.get(
        item.identifier,
      );

      if (entityData) {
        aggregatedPayload.push({
          type: item.type,
          data: entityData,
        });
        validPublishedItems.push(item);
      } else {
        removedItemsCount++;
      }
    }

    // 5. Save History Snapshot
    await CurationHistory.create({
      curation_type,
      published_items: validPublishedItems,
      published_by: admin_id,
    });

    // 6. Update Main Curation Document
    await Curation.findOneAndUpdate(
      { curation_type },
      {
        $set: {
          published_items: validPublishedItems,
          last_published_at: new Date(),
          last_published_by: admin_id,
        },
      },
    );

    // 7. Cache final payload to Redis
    await redis.set(
      `homepage:${curation_type}`,
      JSON.stringify(aggregatedPayload),
    );

    return NextResponse.json({
      message: "Curated feed published successfully",
      removed_tombstones: removedItemsCount,
      cache_key: `homepage:${curation_type}`,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "curation: publish and aggregate",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
