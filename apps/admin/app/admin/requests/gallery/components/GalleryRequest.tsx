import { Indicator, Avatar, Button } from "@mantine/core";
import React from "react";
import { GalleryType } from "./RequestWrapper";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { MenuDropdown } from "./MenuOptions";
import { useDisclosure } from "@mantine/hooks";
import { GalleryInfoModal } from "./GalleryInfoModal";

interface SingleGalleryRequestType {
  gallery: GalleryType;
  tab: "approved" | "pending" | "rejected";
}

export default function GalleryRequest({
  gallery,
  tab,
}: SingleGalleryRequestType) {
  const image_href = getGalleryLogoFileView(gallery.logo as string, 200);
  const [opened, { open, close }] = useDisclosure(false);

  // Status styling configuration
  const statusConfig = {
    approved: {
      borderColor: "border-emerald-200",
      bgColor: "bg-gradient-to-r from-emerald-50/80 to-green-50/60",
      shadowColor: "shadow-emerald-100/50",
      indicatorColor: "green",
      glowColor: "ring-emerald-200/50",
    },
    pending: {
      borderColor: "border-amber-200",
      bgColor: "bg-gradient-to-r from-amber-50/80 to-orange-50/60",
      shadowColor: "shadow-amber-100/50",
      indicatorColor: "red",
      glowColor: "ring-amber-200/50",
    },
    rejected: {
      borderColor: "border-red-200",
      bgColor: "bg-gradient-to-r from-red-50/80 to-rose-50/60",
      shadowColor: "shadow-red-100/50",
      indicatorColor: "red",
      glowColor: "ring-red-200/50",
    },
  };

  const currentStyle = statusConfig[tab];

  return (
    <div className="w-full p-1">
      <div
        className={`
        group relative rounded-xl border ${currentStyle.borderColor} ${currentStyle.bgColor} 
        backdrop-blur-sm transition-all duration-500 ${currentStyle.shadowColor}
        ${currentStyle.glowColor}
        transform-gpu
      `}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Main content */}
        <div className="relative z-10 flex justify-between items-center px-4 py-2">
          {/* Left section - Avatar and Info */}
          <div className="flex gap-x-4 items-center">
            <div className="relative">
              <Indicator
                inline
                disabled={tab === "approved" || tab === "rejected"}
                processing={tab === "pending"}
                color={currentStyle.indicatorColor}
                size={14}
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <div className="relative">
                  <Avatar
                    size="lg"
                    radius="lg"
                    src={image_href}
                    className="transition-all duration-300 group-hover:shadow-lg ring-2 ring-white group-hover:ring-4"
                  />
                  {/* Avatar glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Indicator>
            </div>

            <div className="flex flex-col space-y-1">
              <h4 className="text-fluid-base font-semibold text-gray-900 transition-colors duration-300 ">
                {gallery.name}
              </h4>
              <p className="text-sm text-gray-600 font-medium transition-colors duration-300 group-hover:text-gray-500">
                {gallery.email}
              </p>

              {/* Status badge */}
              <div className="flex items-center mt-2">
                <span
                  className={`
                  inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium capitalize
                  ${tab === "approved" ? "bg-emerald-100 text-emerald-800" : ""}
                  ${tab === "pending" ? "bg-amber-100 text-amber-800" : ""}
                  ${tab === "rejected" ? "bg-red-100 text-red-800" : ""}
                  transition-all duration-300 group-hover:shadow-sm
                `}
                >
                  <div
                    className={`
                    w-1.5 h-1.5 rounded-xl mr-1.5
                    ${tab === "approved" ? "bg-emerald-500" : ""}
                    ${tab === "pending" ? "bg-amber-500 animate-pulse" : ""}
                    ${tab === "rejected" ? "bg-red-500" : ""}
                  `}
                  />
                  {tab}
                </span>
              </div>
            </div>
          </div>

          {/* Modal */}
          <GalleryInfoModal opened={opened} close={close} gallery={gallery} />

          {/* Right section - Actions */}
          <div className="flex gap-x-3 items-center">
            <Button
              variant="gradient"
              gradient={{ from: "#1a1a1a", to: "#1a1a1a", deg: 45 }}
              size="sm"
              radius="md"
              className="
                font-medium text-sm px-4 py-2.5 shadow-lg hover:shadow-xl
                transition-all duration-300 hover:scale-105 active:scale-95
                ring-1 ring-blue-200/50 hover:ring-blue-300/70
                transform-gpu
              "
              onClick={open}
              styles={{
                root: {
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                },
              }}
            >
              View Details
            </Button>

            {tab !== "approved" && (
              <div className="transition-all duration-300 hover:scale-105">
                <MenuDropdown tab={tab} gallery={gallery} />
              </div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-white/10 opacity-0 group-hover:opacity-30 transition-all duration-500 transform group-hover:scale-110" />
        <div className="absolute bottom-4 right-8 w-6 h-6 rounded-xl bg-white/5 opacity-0 group-hover:opacity-50 transition-all duration-700" />

        {/* Bottom shine effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
}
