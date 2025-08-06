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
    icon,
    label,
    value,
    iconColor,
    bgColor,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    iconColor: string;
    bgColor: string;
  }) => (
    <div className="flex items-center space-x-4 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
      <div
        className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-fluid-xxs text-gray-500 font-medium">{label}</p>
        <p className="text-fluid-xs text-gray-900 font-semibold">{value}</p>
      </div>
    </div>
  );

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius="lg"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
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
        {/* Main modal content */}
        <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header section with logo */}
          <div className="relative bg-gray-50 border-b border-gray-100">
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-xl leading-none">×</span>
            </button>

            {/* Content */}
            <div className="p-6 text-center">
              {/* Logo container */}
              <div className="relative mx-auto w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-white rounded-2xl shadow-lg" />
                <div className="relative w-full h-full p-2">
                  <Image
                    src={image_href}
                    alt={`${gallery.name} logo`}
                    className="w-full h-full object-cover rounded-xl"
                    radius="lg"
                  />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-fluid-sm font-semibold text-gray-900 mb-2">
                Gallery Information
              </h2>

              {/* Subtitle */}
              <p className="text-gray-600 text-fluid-xs">
                Details for {gallery.name}
              </p>
            </div>
          </div>

          {/* Content section */}
          <div className="p-8 space-y-5">
            <InfoRow
              icon={<Building2 className="text-blue-600" />}
              label="Gallery Name"
              value={gallery.name}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />

            <InfoRow
              icon={<Mail className="text-green-600" />}
              label="Email Address"
              value={gallery.email}
              iconColor="text-green-600"
              bgColor="bg-green-50"
            />

            <InfoRow
              icon={<User className="text-purple-600" />}
              label="Administrator"
              value={gallery.admin}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            />

            <InfoRow
              icon={<MapPin className="text-orange-600" />}
              label="Location"
              value={`${gallery.address.state}, ${gallery.address.country}`}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
            />

            {/* Action button */}
            <div className="pt-6 flex justify-center">
              <Button
                onClick={close}
                size="sm"
                radius="md"
                className="px-8"
                styles={{
                  root: {
                    backgroundColor: "#111827",
                    color: "white",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#1f2937",
                      transform: "translateY(-1px)",
                      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                    },
                  },
                }}
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
