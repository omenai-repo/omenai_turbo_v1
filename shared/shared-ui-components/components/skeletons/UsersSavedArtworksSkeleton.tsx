import { Skeleton } from "@mantine/core";
import { ArtworkCardSkeleton } from "./ArtworkCardSkeleton";
export const UsersSavedArtworksSkeleton = () => {
  return (
    <div className="pb-5">
      {/* Header Section */}
      <div className="my-5">
        <Skeleton height={32} width={280} radius="md" className="mb-2" />
        <Skeleton height={20} width={220} radius="md" />
      </div>

      {/* Artwork Count */}
      <Skeleton height={18} width={120} radius="md" className="my-4" />

      {/* Artworks Grid */}
      <div className="flex flex-wrap gap-x-4 justify-center">
        {/* Column 1 */}
        <Column />

        {/* Column 2 */}
        <Column />

        {/* Column 3  */}
        <Column />
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

function Column() {
  return (
    <div className="flex-1 gap-2 space-y-6">
      {[...Array(3)].map((_, i) => (
        <ArtworkCardSkeleton key={`col1-${i}`} />
      ))}
    </div>
  );
}
