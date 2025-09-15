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
    <div className="w-full max-w-4xl">
      <LogoPickerModal />

      {/* Design 1: Clean Profile Header */}
      <div className="bg-white rounded shadow-sm border border-slate-200 p-6 my-4">
        <div className="flex items-center gap-6">
          {/* Logo Container */}
          <div className="relative group">
            <div className="w-32 h-32 rounded overflow-hidden bg-slate-100 ring-4 ring-white shadow-fluid-base">
              {logo !== "" ? (
                <Image
                  src={logo}
                  alt="Gallery logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-fit object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Hover Overlay */}
            <button
              onClick={() => updateModal(true)}
              className="absolute inset-0 bg-slate-900/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center"
            >
              <div className="text-white text-center">
                <svg
                  className="w-8 h-8 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Change</span>
              </div>
            </button>
          </div>

          {/* Logo Info */}
          <div className="flex-1">
            <h3 className="text-fluid-base font-semibold text-slate-900 mb-2">
              Gallery Logo
            </h3>
            <p className="text-fluid-xs text-slate-600 mb-4">
              This logo will appear on your gallery profile and listings
            </p>
            <button
              onClick={() => updateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-normal rounded hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Logo
            </button>
          </div>
        </div>
      </div>

      <FormCard />
    </div>
  );
}
