import { Skeleton } from "@mantine/core";
import React from "react";

export default function ArtworkPricingSkeleton() {
  return (
    <div className="w-[50vw]">
      <Skeleton
        h={20}
        w={"30%"}
        radius={"md"}
        className="font-bold text-fluid-base"
      />
      <Skeleton
        radius={"sm"}
        className="flex flex-col w-full space-y-4 py-5 my-6"
      >
        <Skeleton h={12} radius={"md"} w={"30%"} />
        <Skeleton h={50} radius={"md"} w={"30%"} />
        <Skeleton h={20} radius={"md"} w={"40%"} />
      </Skeleton>
      <Skeleton h={16} w={"80%"} radius={"md"} />

      <Skeleton radius={"sm"} h={100} className="mb-4 mt-8 space-y-2">
        <Skeleton h={16} w={"70%"} radius={"md"} />
        <Skeleton h={16} w={"85%"} radius={"md"} />
      </Skeleton>

      <div className="w-full flex justify-between items-center gap-x-4 mb-2 mt-6">
        <Skeleton h={50} width={"40%"} radius={"md"} />
        <Skeleton h={50} width={"40%"} radius={"md"} />
      </div>
    </div>
  );
}
