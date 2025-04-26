import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#e5e7eb] ${className}`}
      {...props}
    />
  );
};
