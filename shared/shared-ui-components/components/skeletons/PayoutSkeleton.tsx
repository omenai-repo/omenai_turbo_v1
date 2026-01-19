import { Skeleton } from "@mantine/core";

export default function PayoutSkeleton() {
  return (
    <div>
      <Skeleton height={16} width="10%" mb={12} />
      <Skeleton height={16} width="30%" />
      <div className="mb-8 grid grid-cols-3 gap-8 my-8">
        <Skeleton height={100} radius={10} />
        <Skeleton height={100} radius={10} />
        <Skeleton height={100} radius={10} />
      </div>
      <div className="flex gap-8">
        <Skeleton height={300} radius={10} width="40%" />
        <div className="w-[60%]">
          <div className="mb-4 flex gap-6">
            <Skeleton height={25} radius={10} width={40} />
            <Skeleton height={25} radius={10} width={40} />
            <Skeleton height={25} radius={10} width={40} />
            <Skeleton height={25} radius={10} width={40} />
          </div>
          <Skeleton height={600} radius={10} />
        </div>
      </div>
    </div>
  );
}
