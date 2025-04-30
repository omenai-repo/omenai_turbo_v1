import React from "react";
import { Skeleton } from "@mantine/core";

const TransactionHistorySkeleton = () => {
  return (
    <div className="space-y-4 max-h-[450px]">
      {[...Array(5)].map((_, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center p-4 rounded-2xl bg-gray-100"
        >
          <div className="flex items-center gap-4">
            <Skeleton height={50} width={50} circle />
            <div className="space-y-2">
              <Skeleton height={12} width={160} radius="xl" />
              <Skeleton height={10} width={120} radius="xl" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton height={12} width={60} radius="xl" />
            <Skeleton height={12} width={40} radius="xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistorySkeleton;
