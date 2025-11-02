import { Skeleton } from "@mantine/core";

export const OrderSkeleton = () => {
  return (
    <div className="w-full flex gap-x-6">
      <div className="w-1/6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div className="mb-6" key={idx}>
            <Skeleton height={40} mt={10} width="100%" radius="xl" />
          </div>
        ))}
      </div>
      <div className="w-full space-y-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white px-4 py-2 rounded shadow w-full">
            <Skeleton
              height={50}
              circle
              className="rounded"
              width={"7%"}
              mb="sm"
            />

            <Skeleton height={20} width="10%" radius="xl" />
            <Skeleton height={20} mt={6} width="20%" radius="xl" />
          </div>
        ))}
      </div>
    </div>
  );
};
