import { Skeleton } from "@mantine/core";

export function GalleryProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <Skeleton height={150} radius="md" className="mb-3" />
      <div className="flex gap-8 my-10">
        <div className="w-[60%]">
          <Skeleton height={200} radius="md" className="mb-3" />
          <Skeleton height={200} radius="md" className="mb-3" />
        </div>
        <Skeleton height={300} width={"40%"} radius="md" className="mb-3" />
      </div>
    </div>
  );
}
