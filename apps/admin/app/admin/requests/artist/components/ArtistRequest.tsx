"use client";

import { Avatar, Badge, Button } from "@mantine/core";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import Link from "next/link";
import { ArtistType } from "./ArtistRequestWrapper";
import { Eye, Shield, Mail } from "lucide-react";

interface SingleArtistRequestType {
  artist: ArtistType;
  tab: "approved" | "pending";
}

const STATUS_STYLES = {
  approved: {
    label: "Approved",
    badgeColor: "green",
    accent: "bg-emerald-500",
  },
  pending: {
    label: "Pending review",
    badgeColor: "orange",
    accent: "bg-amber-500",
  },
};

export default function ArtistRequest({
  artist,
  tab,
}: SingleArtistRequestType) {
  const imageHref = getGalleryLogoFileView(artist.logo as string, 200);
  const status = STATUS_STYLES[tab];

  return (
    <div className="relative group">
      {/* Status accent */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${status.accent}`}
      />

      <div
        className="
          flex items-center justify-between gap-6
          rounded border border-neutral-200 bg-white
          px-5 py-4 pl-6
          transition
          hover:border-neutral-300 hover:shadow-sm
        "
      >
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4 min-w-0">
          <Avatar src={imageHref} radius="md" size={44} className="shrink-0" />

          <div className="flex flex-col min-w-0 gap-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-medium text-neutral-900">
                {artist.name}
              </h3>

              <Badge
                size="xs"
                color={status.badgeColor}
                variant="light"
                radius="sm"
              >
                {status.label}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Mail size={13} />
              <span className="truncate">{artist.email}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {tab === "approved" ? (
            <Button
              size="xs"
              variant="subtle"
              radius="sm"
              color="red"
              leftSection={<Shield size={14} />}
              className="
                text-red-600
                hover:bg-red-50
                transition
              "
            >
              Block
            </Button>
          ) : (
            <Link href={`/admin/requests/artist/info?id=${artist.artist_id}`}>
              <Button
                size="xs"
                variant="subtle"
                radius="sm"
                leftSection={<Eye size={14} />}
                className="
                  text-neutral-700
                  hover:bg-neutral-100
                  transition
                "
              >
                View
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
