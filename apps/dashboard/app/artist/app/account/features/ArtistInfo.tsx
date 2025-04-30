"use client";
import { FormCard } from "./components/FormCard";
import LogoPickerModal from "./components/LogoPickerModal";
import { galleryLogoUpdate } from "@omenai/shared-state-store/src/gallery/gallery_logo_upload/GalleryLogoUpload";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import Image from "next/image";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { RxAvatar } from "react-icons/rx";
import { ArtistSchemaTypes } from "@omenai/shared-types";
export default function ArtistInfo() {
  const { updateModal } = galleryLogoUpdate();
  const { session } = useContext(SessionContext);
  let logo;

  logo = getGalleryLogoFileView(
    (session as ArtistSchemaTypes).logo as string,
    80
  );

  return (
    <div>
      <LogoPickerModal />
      <div
        className="flex gap-3 items-center my-5 cursor-pointer"
        onClick={() => updateModal(true)}
      >
        <div className=" bg-[#eee] rounded-full flex items-center justify-center">
          {logo !== "" ? (
            <Image
              src={logo}
              alt="user avatar"
              width={100}
              height={100}
              className="rounded-full h-[100px] w-[100px] object-top overflow-hidden"
            />
          ) : (
            <RxAvatar />
          )}
        </div>
        <button className="h-[35px] py-4 px-6 rounded-full w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal">
          Edit profile logo
        </button>
      </div>

      <FormCard />
    </div>
  );
}
