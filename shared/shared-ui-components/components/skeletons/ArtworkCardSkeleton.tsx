import { Skeleton } from "@mantine/core";
export const ArtworkCardSkeleton = () => {
  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
      {/* Image Skeleton */}
      <Skeleton height={280} width="100%" radius={0} />

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton height={20} width="80%" radius="md" />

        {/* Artist Name */}
        <Skeleton height={16} width="60%" radius="md" />

        {/* Details Row (Medium, Price, etc) */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton height={16} width="40%" radius="md" />
          <Skeleton height={20} width="30%" radius="md" />
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Skeleton height={32} width={32} circle />
            <Skeleton height={16} width={40} radius="md" />
          </div>
          <Skeleton height={36} width={100} radius="sm" />
        </div>
      </div>
    </div>
  );
};
