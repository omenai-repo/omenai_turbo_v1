import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { fetchArtworksFromCache } from "../../artworks/utils";
import { createErrorRollbarReport } from "../../util";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import {
  serverDatabases,
  sQuery,
} from "@omenai/appwrite-config/serverAppwrite";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const databaseId = process.env.APPWRITE_EDITORIAL_DATABASE_ID!;
const tableId = process.env.APPWRITE_EDITORIAL_COLLECTION_ID!;

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Grab the search query from the URL
    const search = searchParams.get("search") || "";

    // Pagination defaults
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    if (!type) {
      throw new Error("Type parameter is required");
    }

    let data: any[] = [];
    let totalItems = 0; // We need this to tell the frontend how many pages there are

    await connectMongoDB();
    switch (type) {
      case "artwork":
        // Create a search query object. If search exists, do a case-insensitive regex match on the title.
        const artQuery = search
          ? { title: { $regex: search, $options: "i" } }
          : {};

        totalItems = await Artworkuploads.countDocuments(artQuery);

        const artworkDocs = await Artworkuploads.find(artQuery)
          .select("art_id -_id")
          .skip(skip)
          .limit(limit)
          .lean();

        const artIds = artworkDocs.map((doc: any) => doc.art_id);

        if (artIds.length > 0) {
          data = await fetchArtworksFromCache(artIds);
        }
        break;

      case "gallery":
        const galQuery = search
          ? { name: { $regex: search, $options: "i" } }
          : {};
        totalItems = await AccountGallery.countDocuments(galQuery);
        data = await AccountGallery.find(galQuery)
          .skip(skip)
          .limit(limit)
          .lean();
        break;

      case "events":
        const eventQuery = search
          ? { title: { $regex: search, $options: "i" } }
          : {};
        totalItems = await GalleryEvent.countDocuments(eventQuery);
        data = await GalleryEvent.find(eventQuery)
          .skip(skip)
          .limit(limit)
          .lean();
        break;

      case "article":
        // Build the queries array dynamically so we can push the search query if it exists
        const appwriteQueries = [
          sQuery.limit(limit),
          sQuery.offset(skip),
          sQuery.orderDesc("$createdAt"),
        ];

        if (search) {
          appwriteQueries.push(sQuery.contains("headline", search));
        }

        const appwriteRes = await serverDatabases.listRows({
          databaseId,
          tableId,
          queries: appwriteQueries,
          total: true,
        });

        data = appwriteRes.rows;
        totalItems = appwriteRes.total;
        break;

      case "promotionals":
        const promoQuery = search
          ? {
              $or: [
                { headline: { $regex: search, $options: "i" } },
                { subheadline: { $regex: search, $options: "i" } },
              ],
            }
          : {};

        totalItems = await PromotionalModel.countDocuments(promoQuery);
        data = await PromotionalModel.find(promoQuery)
          .skip(skip)
          .limit(limit)
          .lean();
        break;
      default:
        throw new Error(`Invalid curation type requested: ${type}`);
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit), // Calculate total pages for the frontend
      },
    });
  } catch (error) {
    console.log(error);
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      `library fetch: ${request.url}`,
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
