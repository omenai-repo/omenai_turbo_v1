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

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-x-3 items-center">
          <Indicator
            inline
            disabled={tab === "approved" || tab === "rejected"}
            processing={tab === "pending"}
            color="red"
            size={12}
          >
            <Avatar size="lg" radius="sm" src={image_href} />
          </Indicator>
          <div className="flex flex-col">
            <h4 className="text-fluid-xs font-medium">{gallery.name}</h4>
            <p className="text-fluid-xxs text-dark/70 font-normal">
              {gallery.email}
            </p>
          </div>
        </div>
        <GalleryInfoModal opened={opened} close={close} gallery={gallery} />
        <div className="flex gap-x-3 items-center">
          <Button
            variant="default"
            size="sm"
            radius="xl"
            className="text-fluid-xxs font-normal"
            onClick={open}
          >
            View Gallery Information
          </Button>
          {tab !== "approved" && <MenuDropdown tab={tab} gallery={gallery} />}
        </div>
      </div>
    </div>
  );
}
