import { Skeleton } from "@mantine/core";
import React from "react";

export default function ArtworkPricingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Left Column: The Workspace (65%) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
        {/* Price Reveal & Trigger Card Skeleton */}
        <div className="bg-white border border-neutral-200 rounded -2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center gap-5">
            <Skeleton h={14} w={"30%"} radius="md" />
            <Skeleton h={64} w={"50%"} radius="md" />
            <Skeleton h={32} w={"35%"} radius="xl" />
          </div>
          <div className="bg-neutral-50 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-neutral-100">
            <div className="w-full sm:w-1/2 space-y-2">
              <Skeleton h={16} w={"80%"} radius="md" />
              <Skeleton h={12} w={"60%"} radius="md" />
            </div>
            <Skeleton h={40} w={"150px"} radius="md" />
          </div>
        </div>

        {/* Price Visibility Skeleton */}
        <div className="bg-white border border-neutral-200 rounded -2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="space-y-2">
            <Skeleton h={20} w={"30%"} radius="md" />
            <Skeleton h={14} w={"50%"} radius="md" />
          </div>
          <Skeleton h={48} w={"100%"} radius="md" className="md:w-2/3" />
        </div>
      </div>

      {/* Right Column: Commitment Panel (35%) */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
        {/* Agreements Skeleton */}
        <div className="bg-white border border-neutral-200 rounded -2xl overflow-hidden shadow-sm flex flex-col">
          <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200 flex gap-3 items-center">
            <Skeleton h={20} w={20} radius="sm" />
            <Skeleton h={16} w={"50%"} radius="md" />
          </div>
          <div className="p-5 flex flex-col gap-3">
            <Skeleton h={60} w={"100%"} radius="md" />
            <Skeleton h={60} w={"100%"} radius="md" />
            <Skeleton h={60} w={"100%"} radius="md" />
          </div>
          <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100">
            <Skeleton h={14} w={"40%"} radius="md" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col gap-3">
          <Skeleton h={56} w={"100%"} radius="md" />
          <Skeleton h={48} w={"100%"} radius="md" />
        </div>
      </div>
    </div>
  );
}
