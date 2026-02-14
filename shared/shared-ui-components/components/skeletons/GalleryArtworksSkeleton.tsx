import { Skeleton } from "@mantine/core";
import { ArtworkCardSkeleton } from "./ArtworkCardSkeleton";
export const GalleryArtworksSkeleton = () => {
  return (
    <div className="pb-5">
      {/* Artworks Grid */}
      <div className="flex flex-wrap gap-x-4 justify-center">
        {/* Column 1 */}
        <div className="flex-1 gap-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <ArtworkCardSkeleton key={`col1-${i}`} />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex-1 gap-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <ArtworkCardSkeleton key={`col2-${i}`} />
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
      </div>
    </div>
  );
};
