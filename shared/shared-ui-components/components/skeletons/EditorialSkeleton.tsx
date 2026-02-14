import { Skeleton } from "@mantine/core";

export function EditorialSkeleton() {
  return (
    <div className="min-h-screen bg-gray-800">
      <div>
        <Skeleton height={40} width={400} radius="md" className="mb-3" />
        <Skeleton height={20} width={700} radius="md" className="mb-3" />{" "}
        <Skeleton height={20} width={200} radius="md" className="mb-6" />{" "}
      </div>
      <div className="  grid grid-cols-3 gap-8">
        <Skeleton height={30} radius="md" className="mb-3" />
      </div>
      <div className="grid grid-cols-3 gap-8">
        <Skeleton height={300} radius="md" className="mb-3" />
        <Skeleton height={300} radius="md" className="mb-3" />
        <Skeleton height={300} radius="md" className="mb-3" />
      </div>
    </div>
  );
}
