import { Indicator, Avatar, Button } from "@mantine/core";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { ArtistType } from "./ArtistRequestWrapper";
import { Eye, Shield, Palette, Mail } from "lucide-react";

interface SingleArtistRequestType {
  artist: ArtistType;
  tab: "approved" | "pending";
}

export default function ArtistRequest({
  artist,
  tab,
}: SingleArtistRequestType) {
  const image_href = getGalleryLogoFileView(artist.logo as string, 200);

  // Status styling configuration
  const statusConfig = {
    approved: {
      bgColor: "bg-gradient-to-r from-emerald-50/80 to-green-50/60",
      shadowColor: "shadow-emerald-100/50",
      indicatorColor: "green",
      glowColor: "ring-emerald-200/50",
      badgeStyle: "bg-emerald-100 text-emerald-800",
      dotStyle: "bg-emerald-500",
    },
    pending: {
      bgColor: "bg-gradient-to-r from-amber-50/80 to-orange-50/60",
      shadowColor: "shadow-amber-100/50",
      indicatorColor: "red",
      glowColor: "ring-amber-200/50",
      badgeStyle: "bg-amber-100 text-amber-800",
      dotStyle: "bg-amber-500 animate-pulse",
    },
  };

  const currentStyle = statusConfig[tab];

  return (
    <div className="w-full p-1">
      <div
        className={`
        group relative rounded-xl ${currentStyle.bgColor} 
        backdrop-blur-sm transition-all duration-500
        transform-gpu
      `}
      >
        {/* Main content */}
        <div className="relative z-10 flex justify-between items-center px-4 py-2">
          {/* Left section - Avatar and Info */}
          <div className="flex gap-x-4 items-center">
            <div className="relative">
              <Indicator
                inline
                disabled={tab === "approved"}
                processing={tab === "pending"}
                color={currentStyle.indicatorColor}
                size={12}
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <div className="relative">
                  <Avatar
                    size="lg"
                    radius="lg"
                    src={image_href}
                    className="transition-all duration-300 group-hover:shadow-lg ring-2 ring-white group-hover:ring-4"
                  />
                </div>
              </Indicator>
            </div>

            <div className="flex flex-col">
              <h4 className="text-fluid-base font-semibold text-gray-900 transition-colors duration-300flex items-center gap-x-2">
                {artist.name}
              </h4>

              <div className="flex items-center gap-x-1.5 text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-500">
                <Mail size={14} />
                <span className="font-medium text-fluid-xs">
                  {artist.email}
                </span>
              </div>

              {/* Status badge */}
              <div className="flex items-center mt-2">
                <span
                  className={`
                  inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium capitalize
                  ${currentStyle.badgeStyle}
                  transition-all duration-300 group-hover:shadow-sm
                `}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-xl mr-1.5 ${currentStyle.dotStyle}`}
                  />
                  {tab}
                </span>
              </div>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex gap-x-3 items-center">
            {tab === "approved" ? (
              <Button
                variant="gradient"
                gradient={{ from: "red", to: "pink", deg: 45 }}
                size="sm"
                radius="xl"
                leftSection={<Shield size={16} />}
                className="
                  font-medium text-sm px-6 py-2.5 shadow-lg
                  transition-all duration-300 
                  ring-1 ring-red-200/50 hover:ring-red-300/70
                  transform-gpu
                "
                styles={{
                  root: {
                    "&:hover": {
                      transform: "translateY(-2px)",
                    },
                  },
                }}
              >
                Block Artist
              </Button>
            ) : (
              <Link
                href={`/admin/requests/artist/info?id=${artist.artist_id}`}
                className="transition-all duration-300 hover:scale-105"
              >
                <Button
                  variant="gradient"
                  gradient={{ from: "#1a1a1a", to: "#1a1a1a", deg: 45 }}
                  size="sm"
                  radius="md"
                  leftSection={<Eye size={16} />}
                  className="
                    font-medium text-sm px-6 py-2.5 shadow-lg
                    transition-all duration-300 
                    ring-1 ring-blue-200/50 hover:ring-blue-300/70
                    transform-gpu
                  "
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
              </Link>
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
