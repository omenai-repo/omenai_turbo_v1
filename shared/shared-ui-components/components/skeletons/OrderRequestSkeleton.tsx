import { Skeleton } from "@mantine/core";

export const OrderRequestSkeleton = () => {
  return (
    <>
      {[...Array(2)].map((_, idx) => (
        <div key={idx} className="bg-white p-4 rounded-2xl shadow w-full">
          <Skeleton
            height={50}
            className="rounded-[10px]"
            width={"7%"}
            mb="sm"
          />

          <Skeleton height={20} width="30%" radius="xl" />
          <Skeleton height={20} mt={6} width="40%" radius="xl" />
        </div>
      ))}
    </>
  );
};
