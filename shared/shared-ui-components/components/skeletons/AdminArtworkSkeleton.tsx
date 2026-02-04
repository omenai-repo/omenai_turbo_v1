import React from "react";
import { ArtworkCardSkeleton } from "./ArtworkCardSkeleton";
import { Skeleton } from "@mantine/core";

export function AdminArtworkSkeleton() {
  return (
    <div>
      <div className="px-8">
        <Skeleton height={50} width={200} radius="md" />
      </div>
      <div className="p-6 md:p-8 animate-in fade-in duration-300">
        <div className="w-full my-3">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ArtworkCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
