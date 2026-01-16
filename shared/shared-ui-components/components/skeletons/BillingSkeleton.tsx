import React from "react";
import { Skeleton } from "@mantine/core";

export default function BillingSkeleton() {
  return (
    <div>
      <div className="flex gap-8">
        <Skeleton radius={10} height={600} width="60%" mb={16} />
        <div className=" w-[40%]">
          <Skeleton radius={10} height={290} mb={16} />
          <Skeleton radius={10} height={290} mb={16} />
        </div>
      </div>
      <div className="flex gap-8">
        <Skeleton radius={10} height={400} width="40%" mb={16} />
        <Skeleton radius={10} height={400} width="60%" mb={16} />
      </div>
    </div>
  );
}
