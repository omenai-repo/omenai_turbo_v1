import { Skeleton } from "@mantine/core";

export function ArtistProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <div>
        <Skeleton height={20} width={400} radius="md" className="mb-3" />
        <Skeleton height={20} width={400} radius="md" className="mb-3" />{" "}
      </div>
      <div className="my-10 grid grid-cols-3 gap-8">
        <Skeleton height={50} radius="md" className="mb-3" />
        <Skeleton height={50} radius="md" className="mb-3" />
        <Skeleton height={50} radius="md" className="mb-3" />
      </div>
      <Skeleton height={600} radius="md" className="mb-3" />
    </div>
  );
}
