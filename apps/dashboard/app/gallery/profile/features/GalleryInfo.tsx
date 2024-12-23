"use client";
import { FormCard } from "./components/FormCard";
import LogoPickerModal from "./components/LogoPickerModal";
import { galleryLogoUpdate } from "@omenai/shared-state-store/src/gallery/gallery_logo_upload/GalleryLogoUpload";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import Image from "next/image";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { RxAvatar } from "react-icons/rx";
import { GallerySchemaTypes } from "@omenai/shared-types";
export default function GalleryInfo() {
  const { updateModal } = galleryLogoUpdate();
  const { session } = useContext(SessionContext);
  let logo;

  logo = getGalleryLogoFileView(
    (session as GallerySchemaTypes).logo as string,
    80
  );

  return (
    <div>
      <LogoPickerModal />
      <div
        className="flex gap-3 items-center my-5 cursor-pointer"
        onClick={() => updateModal(true)}
      >
        <div className=" bg-[#eee] flex items-center justify-center">
          {logo !== "" ? (
            <Image
              src={logo}
              alt="user avatar"
              width={45}
              height={45}
              className="rounded-2xl overflow-hidden"
            />
          ) : (
            <RxAvatar />
          )}
        </div>
        <p className="text-dark px-5 lg:px-2 text-xs">Edit profile logo</p>
      </div>

      <FormCard />
    </div>
  );
}
