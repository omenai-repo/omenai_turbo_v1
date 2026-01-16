import { Skeleton } from "@mantine/core";
export const UsersOrdersTabSkeleton = () => {
  return (
    <div className="w-full max-w-full mx-auto space-y-8">
      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton height={32} width={220} radius="md" className="mb-2" />
          <Skeleton height={20} width={200} radius="md" />
        </div>
        <div className="flex items-center gap-x-3 px-4 py-2 w-fit bg-white border border-slate-200 rounded-full shadow-sm">
          <Skeleton height={16} width={90} radius="md" />
          <span className="h-4 w-[1px] bg-slate-200"></span>
          <Skeleton height={20} width={30} radius="md" />
        </div>
      </div>

      {/* Tabs Navigation Skeleton */}
      <div className="space-y-8">
        <div className="flex flex-wrap gap-2">
          <Skeleton height={40} width={140} radius="md" />
          <Skeleton height={40} width={160} radius="md" />
          <Skeleton height={40} width={150} radius="md" />
        </div>

        {/* Content Area Skeleton */}
        <div className="min-h-[400px] space-y-4">
          {/* Order Cards Skeleton */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left side - Image */}
                <Skeleton height={60} width={60} radius="lg" />

                {/* Middle - Order Details */}
                <div className="flex-1 space-y-3">
                  <Skeleton height={24} width="60%" radius="md" />
                  <Skeleton height={18} width="40%" radius="md" />
                </div>

                {/* Right side - Actions */}
                <div className="flex flex-col justify-between items-end gap-3">
                  <Skeleton height={32} width={120} radius="lg" />
                  {/* <Skeleton height={20} width={100} radius="md" /> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
