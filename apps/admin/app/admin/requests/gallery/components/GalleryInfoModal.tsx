import { Modal, Button, Group, Paper, Card, Text, Image } from "@mantine/core";
import { Badge, MapPin, Mail, User, Building2, Sparkles } from "lucide-react";
import { GalleryType } from "./RequestWrapper";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";

export function GalleryInfoModal({
  opened,
  close,
  gallery,
}: {
  opened: boolean;
  close: () => void;
  gallery: GalleryType;
}) {
  const image_href = getGalleryLogoFileView(gallery.logo as string, 200);

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    gradient,
  }: {
    icon: any;
    label: string;
    value: string;
    gradient: string;
  }) => (
    <div className="group relative flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-100/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-gray-200/70">
      {/* Icon container with gradient */}
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
      >
        <Icon size={20} className="text-white drop-shadow-sm" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-base font-medium text-gray-900 truncate">{value}</p>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="lg"
      radius="xl"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 8,
      }}
      styles={{
        content: {
          backgroundColor: "transparent",
          padding: 0,
          overflow: "visible",
        },
        header: {
          display: "none",
        },
        body: {
          padding: 0,
        },
      }}
    >
      <div className="relative">
        {/* Animated background elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-xl blur-3xl animate-pulse delay-1000" />

        {/* Main modal content */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          {/* Header section with logo */}
          <div className="relative">
            {/* Header gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />

            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
            >
              <span className="text-lg leading-none">×</span>
            </button>

            {/* Content */}
            <div className="relative z-10 px-8 pt-8 pb-12 text-center">
              {/* Logo container */}
              <div className="relative mx-auto w-28 h-28 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl backdrop-blur-sm border " />
                <div className="relative w-full h-full p-2">
                  <Image
                    src={image_href}
                    alt={`${gallery.name} logo`}
                    className="w-full h-full object-cover rounded-xl shadow-lg"
                    radius="lg"
                  />
                </div>
                {/* Logo glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Title */}
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles size={20} className="text-yellow-300 animate-pulse" />
                <h2 className="text-2xl font-bold text-white">
                  Gallery Information
                </h2>
                <Sparkles size={20} className="text-yellow-300 animate-pulse" />
              </div>

              {/* Subtitle */}
              <p className="text-white/80 font-medium">
                Details for {gallery.name}
              </p>
            </div>

            {/* Decorative wave */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg
                className="w-full h-6 text-white"
                fill="currentColor"
                viewBox="0 0 1000 100"
                preserveAspectRatio="none"
              >
                <path d="M0,0 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z" />
              </svg>
            </div>
          </div>

          {/* Content section */}
          <div className="px-8 pb-8 pt-4 space-y-4">
            <InfoRow
              icon={Building2}
              label="Gallery Name"
              value={gallery.name}
              gradient="from-blue-500 to-blue-600"
            />

            <InfoRow
              icon={Mail}
              label="Email Address"
              value={gallery.email}
              gradient="from-green-500 to-emerald-600"
            />

            <InfoRow
              icon={User}
              label="Administrator"
              value={gallery.admin}
              gradient="from-purple-500 to-indigo-600"
            />

            <InfoRow
              icon={MapPin}
              label="Location"
              value={`${gallery.address.state}, ${gallery.address.country}`}
              gradient="from-orange-500 to-red-500"
            />

            {/* Action buttons */}
            <div className="pt-6 flex justify-center space-x-4">
              <Button
                onClick={close}
                variant="gradient"
                gradient={{ from: "indigo", to: "purple", deg: 45 }}
                size="md"
                radius="xl"
                className="px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute top-20 left-4 w-3 h-3 bg-white/30 rounded-xl animate-bounce" />
          <div className="absolute top-32 right-8 w-2 h-2 bg-white/40 rounded-xl animate-bounce delay-300" />
          <div className="absolute bottom-32 left-8 w-2 h-2 bg-white/30 rounded-xl animate-bounce delay-700" />
        </div>
      </div>
    </Modal>
  );
}
