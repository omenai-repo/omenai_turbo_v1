"use client";
import { FormCard } from "./components/FormCard";
import LogoPickerModal from "./components/LogoPickerModal";
import { galleryLogoUpdate } from "@omenai/shared-state-store/src/gallery/gallery_logo_upload/GalleryLogoUpload";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import Image from "next/image";
import { RxAvatar } from "react-icons/rx";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
export default function GalleryInfo() {
  const { updateModal } = galleryLogoUpdate();
  const { user } = useAuth({ requiredRole: "gallery" });
  let logo;

  logo = getGalleryLogoFileView(user.logo as string, 80);

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
        <p className="text-dark px-5 lg:px-2 text-fluid-xs">
          Edit profile logo
        </p>
      </div>

      <FormCard />
    </div>
  );
}
