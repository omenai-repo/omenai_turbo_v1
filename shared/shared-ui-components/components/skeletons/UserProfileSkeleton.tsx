import { Skeleton } from "@mantine/core";
export const UserProfileSkeleton = () => {
  return (
    <div className="min-h-screen w-full text-dark">
      <div className="max-w-7xl mx-auto py-4">
        {/* Header Section Skeleton */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-12">
          {/* Avatar Skeleton */}
          <div className="flex flex-col items-center gap-3">
            <Skeleton height={120} width={120} circle />
          </div>

          {/* Name and Email Section */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div className="space-y-1">
              <Skeleton height={48} width={300} radius="md" className="mb-2" />
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Skeleton height={20} width={180} radius="md" />
                <Skeleton height={24} width={60} radius="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Personal Details Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <Skeleton height={36} width={36} radius="xl" />
                <Skeleton height={24} width={150} radius="md" />
              </div>

              <div className="space-y-6 flex-1">
                {/* Phone Field */}
                <div>
                  <Skeleton
                    height={14}
                    width={120}
                    radius="md"
                    className="mb-2"
                  />
                  <Skeleton height={56} radius="xl" />
                </div>

                {/* Address Section */}
                <div>
                  <Skeleton
                    height={14}
                    width={140}
                    radius="md"
                    className="mb-2"
                  />
                  <div className="space-y-3">
                    <Skeleton height={56} radius="xl" />
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton height={56} radius="xl" />
                      <Skeleton height={56} radius="xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton height={56} radius="xl" />
                      <Skeleton height={56} radius="xl" />
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="w-full grid place-items-center">
                  <Skeleton height={56} radius="md" width="100%" />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-8 mt-auto border-t border-slate-50">
                <Skeleton height={16} width={120} radius="md" />
              </div>
            </div>
          </div>

          {/* Right Column: Preferences Skeleton */}
          <div className="lg:col-span-7">
            {/* Preferences Grid */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Skeleton height={24} width={180} radius="md" />
              </div>

              {/* Grid of preference cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} height={50} radius="xl" />
                ))}
              </div>

              {/* Selected counter */}
              <div className="mt-6 flex justify-center">
                <Skeleton height={20} width={150} radius="md" />
              </div>
            </div>

            {/* Account Security Card Skeleton */}
            <div className="mt-6 bg-gradient-to-r from-dark to-slate-800 rounded-[32px] p-8 shadow-lg">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <Skeleton
                    height={24}
                    width={180}
                    radius="md"
                    className="mb-2"
                  />
                  <Skeleton height={18} width={250} radius="md" />
                </div>
                <Skeleton height={40} width={40} circle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
