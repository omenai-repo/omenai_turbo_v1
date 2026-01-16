"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchGalleryProfile } from "@omenai/shared-services/gallery/fetchGalleryProfile";
import { GalleryProfileSkeleton } from "@omenai/shared-ui-components/components/skeletons/GalleryProfileSkeleton";
import { useQuery } from "@tanstack/react-query";
import AccountInformation from "./AccountInformation";

export const AccountInformationWrapper = () => {
  const { user } = useAuth({ requiredRole: "gallery" });

  const { data, error, isLoading } = useQuery({
    queryKey: ["fetch_gallery_info", user.gallery_id],
    queryFn: async () => {
      try {
        const [profile] = await Promise.all([
          fetchGalleryProfile(user.gallery_id),
        ]);

        return {
          profile: profile.gallery,
        };
      } catch (err) {
        console.error("Failed to fetch gallery info:", err);
        throw err; // rethrow so React Query marks query as error
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!user.gallery_id,
  });

  if (isLoading) return <GalleryProfileSkeleton />;

  return <AccountInformation profile={data?.profile} />;
};
