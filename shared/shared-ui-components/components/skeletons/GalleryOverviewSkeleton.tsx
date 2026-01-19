import { Skeleton } from "@mantine/core";
export const GalleryOverviewSkeleton = () => {
  return (
    <div className=" ml-16 pb-8">
      <div className="my-5">
        <Skeleton height={32} width={280} radius="md" className="mb-2" />
        <Skeleton height={20} width={220} radius="md" />
      </div>
      <div className="grid grid-cols-4 gap-8">
        <Skeleton height={80} radius={10} />
        <Skeleton height={80} radius={10} />
        <Skeleton height={80} radius={10} />
        <Skeleton height={80} radius={10} />
      </div>
      <Skeleton height={400} radius={10} className="my-5" />
      <div className="my-5 grid grid-cols-2 gap-8">
        <Skeleton height={200} radius="md" />
        <Skeleton height={200} radius="md" />
      </div>
    </div>
  );
};
