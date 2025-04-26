import { Skeleton } from "@mantine/core";

export const HighlightsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl shadow bg-white">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      ))}
    </div>
  );
};
