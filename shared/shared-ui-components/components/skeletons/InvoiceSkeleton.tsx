import React from "react";
import { Skeleton } from "@mantine/core";

export const ReceiptSkeleton = () => {
  return (
    <div className="flex flex-col h-full font-sans">
      {/* --- Header Skeleton --- */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="space-y-2">
          {/* Title Placeholder */}
          <Skeleton height={24} width={150} radius="md" />
          {/* Invoice # Placeholder */}
          <Skeleton height={14} width={100} radius="md" />
        </div>
        {/* Close Button Placeholder (Optional, usually static) */}
        <Skeleton height={40} width={40} circle />
      </div>

      {/* --- Scrollable Content Skeleton --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Status Badge */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center gap-3">
          <Skeleton height={32} width={32} circle />
          <div className="space-y-2">
            <Skeleton height={14} width={180} radius="sm" />
            <Skeleton height={10} width={120} radius="sm" />
          </div>
        </div>

        {/* Total Amount Hero */}
        <div className="flex flex-col items-center py-4 space-y-3">
          <Skeleton height={14} width={100} radius="sm" />
          <Skeleton height={40} width={180} radius="md" />
        </div>

        {/* Recipient Info */}
        <div className="space-y-4">
          <Skeleton height={12} width={80} radius="sm" />{" "}
          {/* "BILLED TO" Label */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-4">
            {/* Name Row */}
            <div className="flex items-center gap-3">
              <Skeleton height={16} width={16} radius="sm" /> {/* Icon */}
              <Skeleton height={16} width={140} radius="sm" /> {/* Name */}
            </div>
            {/* Email Row */}
            <div className="flex items-center gap-3">
              <Skeleton height={16} width={16} radius="sm" /> {/* Icon */}
              <Skeleton height={14} width={200} radius="sm" /> {/* Email */}
            </div>
            {/* Address Row (Multi-line) */}
            <div className="flex items-start gap-3">
              <Skeleton height={16} width={16} radius="sm" className="mt-1" />{" "}
              {/* Icon */}
              <div className="space-y-2">
                <Skeleton height={14} width={240} radius="sm" />
                <Skeleton height={14} width={180} radius="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <Skeleton height={12} width={80} radius="sm" className="mb-4" />{" "}
          {/* "LINE ITEMS" Label */}
          <div className="space-y-4">
            {/* Generate 3 dummy rows */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0"
              >
                <div className="space-y-2">
                  <Skeleton height={16} width={160} radius="sm" />{" "}
                  {/* Description */}
                  <Skeleton height={12} width={50} radius="sm" /> {/* Qty */}
                </div>
                <Skeleton height={16} width={80} radius="sm" /> {/* Price */}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton height={14} width={60} radius="sm" />
            <Skeleton height={14} width={80} radius="sm" />
          </div>
          <div className="flex justify-between">
            <Skeleton height={14} width={60} radius="sm" />
            <Skeleton height={14} width={80} radius="sm" />
          </div>
          <div className="flex justify-between">
            <Skeleton height={14} width={60} radius="sm" />
            <Skeleton height={14} width={80} radius="sm" />
          </div>

          <div className="h-px bg-gray-200 my-2" />

          <div className="flex justify-between">
            <Skeleton height={20} width={70} radius="sm" /> {/* Total Label */}
            <Skeleton height={20} width={100} radius="sm" /> {/* Total Value */}
          </div>
        </div>
      </div>

      {/* --- Footer Skeleton --- */}
      <div className="p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-4">
        <Skeleton height={48} radius="md" /> {/* Close Button */}
        <Skeleton height={48} radius="md" /> {/* Download Button */}
      </div>
    </div>
  );
};

export default ReceiptSkeleton;
