"use client";

import { Avatar, Button, Badge } from "@mantine/core";
import { Mail } from "lucide-react";
import { useDisclosure } from "@mantine/hooks";

import { GalleryType } from "./RequestWrapper";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { MenuDropdown } from "./MenuOptions";
import { GalleryInfoModal } from "./GalleryInfoModal";

interface SingleGalleryRequestType {
  gallery: GalleryType;
  tab: "approved" | "pending" | "rejected";
}

const STATUS_STYLES = {
  approved: {
    badge: "green",
    accent: "bg-emerald-500",
    label: "Approved",
  },
  pending: {
    badge: "orange",
    accent: "bg-amber-500",
    label: "Pending review",
  },
  rejected: {
    badge: "red",
    accent: "bg-red-500",
    label: "Rejected",
  },
};

export default function GalleryRequest({
  gallery,
  tab,
}: SingleGalleryRequestType) {
  const imageHref = getGalleryLogoFileView(gallery.logo as string, 200);
  const [opened, { open, close }] = useDisclosure(false);

  const status = STATUS_STYLES[tab];

  return (
    <>
      <GalleryInfoModal opened={opened} close={close} gallery={gallery} />

      <div className="relative group">
        {/* Status accent */}
        <div
          className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${status.accent}`}
        />

        <div
          className="
            flex items-center justify-between gap-6
            rounded-lg border border-neutral-200 bg-white
            px-5 py-4 pl-6
            transition-all duration-200
            hover:border-neutral-300 hover:shadow-sm
          "
        >
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-4 min-w-0">
            <Avatar
              src={imageHref}
              radius="md"
              size={44}
              className="shrink-0"
            />

            <div className="flex flex-col min-w-0 gap-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-medium text-neutral-900">
                  {gallery.name}
                </h3>

                <Badge
                  size="xs"
                  color={status.badge}
                  variant="light"
                  radius="sm"
                >
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Mail size={13} />
                <span className="truncate">{gallery.email}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="xs"
              variant="subtle"
              radius="sm"
              className="
                text-neutral-700
                hover:bg-neutral-100
                transition
              "
              onClick={open}
            >
              View
            </Button>

            {tab !== "approved" && <MenuDropdown tab={tab} gallery={gallery} />}
          </div>
        </div>
      </div>
    </>
  );
}
