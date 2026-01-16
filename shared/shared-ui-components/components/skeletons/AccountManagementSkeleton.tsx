import { Skeleton } from "@mantine/core";

// Skeleton Loader Component for Account Management Screen
export const AccountManagementSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <div className="max-w-6xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton height={40} width={350} radius="md" className="mb-3" />
          <Skeleton height={20} width={450} radius="md" />
        </div>

        {/* Tabs Navigation Skeleton */}
        <div className="flex space-x-1 mb-8 bg-gray-400 p-1 rounded-xl">
          <div className="flex-1 px-6 py-3">
            <Skeleton height={40} radius="lg" />
          </div>
          <div className="flex-1 px-6 py-3">
            <Skeleton height={40} radius="lg" />
          </div>
          <div className="flex-1 px-6 py-3">
            <Skeleton height={40} radius="lg" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo Section Skeleton */}
          <div className="flex items-start space-x-6 pb-8 border-b border-line">
            {/* Logo Image Skeleton */}
            <Skeleton height={128} width={128} radius="xl" />

            <div className="flex-1">
              <Skeleton height={36} width={200} radius="md" className="mb-3" />
              <Skeleton height={20} width={400} radius="md" />
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-6 mt-8">
            {/* Artist Name Field */}
            <div>
              <Skeleton height={16} width={100} radius="md" className="mb-2" />
              <Skeleton height={48} radius="xl" />
            </div>

            {/* Email Field */}
            <div>
              <Skeleton height={16} width={120} radius="md" className="mb-2" />
              <Skeleton height={48} radius="xl" />
            </div>

            {/* Address Field */}
            <div>
              <Skeleton height={16} width={110} radius="md" className="mb-2" />
              <div className="p-4 bg-gray-800 border border-line rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Skeleton height={20} width={20} radius="md" />
                    <div className="flex-1">
                      <Skeleton
                        height={20}
                        width="60%"
                        radius="md"
                        className="mb-2"
                      />
                      <Skeleton height={16} width="40%" radius="md" />
                    </div>
                  </div>
                  <Skeleton height={36} width={120} radius="lg" />
                </div>
              </div>
            </div>

            {/* Bio Field */}
            <div>
              <Skeleton height={16} width={130} radius="md" className="mb-2" />
              <Skeleton height={120} radius="xl" />
            </div>
          </div>

          {/* Save Button Skeleton */}
          <div className="flex justify-end pt-6 mt-6 border-t border-line">
            <Skeleton height={48} width={150} radius="xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
