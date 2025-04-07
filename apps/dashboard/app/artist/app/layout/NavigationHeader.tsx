"use client";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import Image from "next/image";
import React from "react";

export default function () {
  const session = useSession() as ArtistSchemaTypes;
  const { artist_sidebar } = artistActionStore();

  const logo_view_link = getGalleryLogoFileView(session.logo, 200);
  console.log(logo_view_link);
  return (
    <div className="px-2 py-6">
      <div className="flex gap-x-2 items-center">
        <Image
          src={logo_view_link}
          alt={"Artist logo"}
          height={30}
          width={30}
          className="object-cover rounded-full w-8 h-8"
        />
        {!artist_sidebar && (
          <div className="flex flex-col text-white">
            <p className="text-[14px]">{session.name}</p>
            <p className="text-xs">Artist</p>
          </div>
        )}
      </div>
    </div>
  );
}
