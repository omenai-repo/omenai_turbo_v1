import React from "react";
import { Skeleton } from "@mantine/core";

export default function BillingSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Billing Card */}
      <div className="rounded overflow-hidden shadow bg-black p-6 text-white h-[300px] relative">
        <Skeleton height={16} width="50%" mb={16} />
        <Skeleton height={24} width="75%" mb={8} />
        <Skeleton height={16} width="25%" />
        <div className="absolute bottom-4 left-4">
          <Skeleton height={40} width={112} radius="xl" />
        </div>
      </div>

      {/* Subscription Info */}
      <div className="rounded border border-dark/20 p-6 flex flex-col gap-4">
        <Skeleton height={16} width="50%" />
        <div className="flex items-center gap-2">
          <Skeleton height={32} width={32} circle />
          <div className="flex flex-col gap-1">
            <Skeleton height={16} width={128} />
            <Skeleton height={12} width={96} />
          </div>
        </div>
        <Skeleton height={12} width={80} />
        <Skeleton height={16} width={40} />
        <Skeleton height={40} width="100%" radius="xl" />
        <Skeleton height={40} width="100%" radius="xl" />
      </div>

      {/* Transaction History */}
      <div className="rounded border border-dark/20 p-6">
        <Skeleton height={16} width="50%" mb={16} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton height={32} width={32} circle />
            <Skeleton height={16} width={160} />
          </div>
          <Skeleton height={16} width={48} />
        </div>
      </div>

      {/* Upcoming */}
      <div className="rounded border border-dark/20 p-6 flex flex-col gap-4">
        <Skeleton height={16} width="33%" />
        <div className="flex items-center gap-2">
          <Skeleton height={32} width={32} circle />
          <Skeleton height={16} width={128} />
        </div>
        <div className="rounded border border-dark/20 p-4 flex justify-between items-center">
          <Skeleton height={16} width={128} />
          <Skeleton height={16} width={128} />
        </div>
      </div>

      {/* Billing Info */}
      <div className="rounded border border-dark/20 p-6 flex flex-col gap-2">
        <Skeleton height={16} width="33%" />
        <Skeleton height={16} width="66%" />
        <Skeleton height={16} width="50%" />
      </div>

      {/* Stripe Balance */}
    </div>
  );
}
