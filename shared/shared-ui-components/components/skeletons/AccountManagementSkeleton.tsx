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

export const UsersSavedArtworksSkeleton = () => {
  return (
    <div className="pb-5">
      {/* Header Section */}
      <div className="my-5">
        <Skeleton height={32} width={280} radius="md" className="mb-2" />
        <Skeleton height={20} width={220} radius="md" />
      </div>

      {/* Artwork Count */}
      <Skeleton height={18} width={120} radius="md" className="my-4" />

      {/* Artworks Grid */}
      <div className="flex flex-wrap gap-x-4 justify-center">
        {/* Column 1 */}
        <div className="flex-1 gap-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <ArtworkCardSkeleton key={`col1-${i}`} />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex-1 gap-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <ArtworkCardSkeleton key={`col2-${i}`} />
          ))}
        </div>

        {/* Column 3  */}
        <div className="flex-1 gap-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <ArtworkCardSkeleton key={`col2-${i}`} />
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
      </div>
    </div>
  );
};

export const GalleryArtworksSkeleton = () => {
  return (
    <div className="pb-5">
      {/* Artworks Grid */}
      <div className="flex flex-wrap gap-x-4 justify-center">
        {/* Column 1 */}
        <div className="flex-1 gap-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <ArtworkCardSkeleton key={`col1-${i}`} />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex-1 gap-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <ArtworkCardSkeleton key={`col2-${i}`} />
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
        <Skeleton height={40} width={40} radius="md" />
      </div>
    </div>
  );
};

const ArtworkCardSkeleton = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Image Skeleton */}
      <Skeleton height={280} width="100%" radius={0} />

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton height={20} width="80%" radius="md" />

        {/* Artist Name */}
        <Skeleton height={16} width="60%" radius="md" />

        {/* Details Row (Medium, Price, etc) */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton height={16} width="40%" radius="md" />
          <Skeleton height={20} width="30%" radius="md" />
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Skeleton height={32} width={32} circle />
            <Skeleton height={16} width={40} radius="md" />
          </div>
          <Skeleton height={36} width={100} radius="lg" />
        </div>
      </div>
    </div>
  );
};

export const GalleryOverviewSkeleton = () => {
  return (
    <div className=" ml-16 pb-8">
      <div className="my-5">
        <Skeleton height={32} width={280} radius="md" className="mb-2" />
        <Skeleton height={20} width={220} radius="md" />
      </div>
      <div className="grid grid-cols-4 gap-8">
        <Skeleton height={80} radius={10} />
        <Skeleton height={80} radius={10} />
        <Skeleton height={80} radius={10} />
        <Skeleton height={80} radius={10} />
      </div>
      <Skeleton height={400} radius={10} className="my-5" />
      <div className="my-5 grid grid-cols-2 gap-8">
        <Skeleton height={200} radius="md" />
        <Skeleton height={200} radius="md" />
      </div>
    </div>
  );
};

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
