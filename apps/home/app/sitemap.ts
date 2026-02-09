import { MetadataRoute } from "next";
import { fetchAllArtworksForSeo } from "@omenai/shared-services/seo/fetchArtIds";

const collections = [
  "photography",
  "acrylic-on-canvas-linen-panel",
  "mixed-media-on-paper-canvas",
  "oil-on-canvas-panel",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const collectionUrls = collections.map((c) => ({
    url: `https://omenai.app/collections/${c}`,
    lastModified,
  }));

  const artworksRes = await fetchAllArtworksForSeo();

  const artworkUrls =
    artworksRes.isOk && artworksRes.data.length > 0
      ? artworksRes.data.map((artwork: { art_id: string }) => ({
          url: `https://omenai.app/artwork/${artwork.art_id}`,
          lastModified,
        }))
      : [];

  return [
    { url: "https://omenai.app/", lastModified },
    { url: "https://auth.omenai.app/login/", lastModified },
    { url: "https://tracking.omenai.app/", lastModified },
    { url: "https://omenai.app/catalog", lastModified },
    { url: "https://omenai.app/articles", lastModified },
    ...collectionUrls,
    ...artworkUrls,
  ];
}
