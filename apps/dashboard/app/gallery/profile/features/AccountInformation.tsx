"use client";
// Tab Components
import React, { useState } from "react";
import { Camera, MapPin, Save } from "lucide-react";
import Image from "next/image";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { updateProfile } from "@omenai/shared-services/update/updateProfile";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { galleryActionStore } from "@omenai/shared-state-store/src/gallery/gallery_actions/GalleryActionStore";
import { useRollbar } from "@rollbar/react";
import {
  BUTTON_CLASS,
  INPUT_CLASS,
  TEXTAREA_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";

export default function AccountInformation({ profile }: { profile: any }) {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const { updateAddressModalPopup, updateLogoModalPopup } =
    galleryActionStore();
  const [loading, setLoading] = useState(false);
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const rollbar = useRollbar();

  // Form state
  const [data, setData] = useState<any>({
    name: profile.name,
    description: profile.description,
    admin: profile.admin,
  });

  // Handle form changes
  const handleInputChange = (field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    // Save logic here
    setHasChanges(false);
    try {
      setLoading(true);

      const updateProfileData = await updateProfile(
        "gallery",
        data,
        user.gallery_id,
        csrf || "",
      );

      if (!updateProfileData.isOk) {
        toast_notif(updateProfileData.body.message, "error");
        return;
      } else toast_notif("Profile info updated successfully", "success");

      await queryClient.invalidateQueries({ queryKey: ["fetch_artist_info"] });
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "Something went wrong, please try again or contact support",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const image_url = getGalleryLogoFileView(profile.logo, 200);

  return (
    <div className=" animate-fadeIn">
      {/* Identity Header */}
      {/* ================= HERO ================= */}
      <div className="relative mb-10 rounded bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />

        <div className="relative flex items-center gap-8">
          {/* Avatar */}
          <div className="relative group">
            <Image
              src={image_url}
              alt="Gallery Logo"
              width={120}
              height={120}
              className="h-[120px] w-[120px] rounded object-cover ring-4 ring-white/20"
            />

            <button
              onClick={() => updateLogoModalPopup(true)}
              className="mx-4 absolute inset-0 flex items-center justify-center rounded bg-dark/60 opacity-0 group-hover:opacity-100 transition"
            >
              <span className="flex items-center flex-col gap-2 rounded bg-white p-2 text-xs font-light text-slate-900">
                <Camera className="h-4 w-4" />
                Update logo
              </span>
            </button>
          </div>

          {/* Identity */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            <p className="text-sm text-white/70">Public gallery profile</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 grid-cols-12">
        <div className="lg:col-span-7 space-y-8">
          {/* About */}
          <div className="rounded bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              About the gallery
            </h3>

            <textarea
              value={data.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={TEXTAREA_CLASS}
              placeholder="Describe the gallery’s vision, focus, and curatorial approach"
            />
          </div>

          {/* Address */}
          <div className="rounded bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              Location
            </h3>

            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-1" />
                <div className="text-sm text-slate-700">
                  <p>{profile.address.address_line}</p>
                  <p className="text-slate-500">
                    {profile.address.city}, {profile.address.state}{" "}
                    {profile.address.zip}
                  </p>
                </div>
              </div>

              <button
                onClick={() => updateAddressModalPopup(true)}
                className="rounded bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Edit Address information
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-5 space-y-8">
          <div className="rounded bg-white p-8 shadow-sm">
            <h3 className="text-sm font-medium text-slate-900 mb-6">
              Account details
            </h3>
            {!hasChanges && (
              <div className="mb-6 flex justify-center">
                <span className="rounded bg-slate-100 px-4 py-1.5 text-xs text-slate-600">
                  You can start typing to edit your information
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Gallery Name */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Gallery name
                </label>
                <input disabled value={data.name} className={INPUT_CLASS} />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Email address
                </label>
                <input disabled value={profile.email} className={INPUT_CLASS} />
              </div>

              {/* Admin */}
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">
                  Gallery administrator
                </label>
                <input
                  value={data.admin}
                  onChange={(e) => handleInputChange("admin", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Floating Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 z-10 w-[90%] max-w-xl -translate-x-1/2 rounded bg-slate-900 px-6 py-3 shadow-xl">
          <div className="flex items-center justify-between text-white">
            <p className="text-sm">You have unsaved changes</p>

            <button
              onClick={handleSave}
              disabled={loading}
              className={BUTTON_CLASS}
            >
              {loading ? <LoadSmall /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
