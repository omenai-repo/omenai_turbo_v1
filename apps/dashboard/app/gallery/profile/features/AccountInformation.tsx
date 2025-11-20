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
        csrf || ""
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
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const image_url = getGalleryLogoFileView(profile.logo, 200);

  return (
    <div className="space-y-4 animate-fadeIn p-4">
      {/* Logo Section */}
      <div className="flex items-start pb-4 space-x-4 border-line">
        <div className="relative group">
          <Image
            src={image_url}
            alt="Artist Logo"
            className="rounded object-fit"
            height={120}
            width={120}
          />
          <div className="absolute inset-0 mx-4 bg-dark/60 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={() => updateLogoModalPopup(true)}
              className="bg-white text-dark px-4 py-2 rounded flex items-center space-x-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
            >
              <Camera className="w-4 h-4" />
              <span className="text-fluid-xxs font-normal">Update</span>
            </button>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-fluid-base font-medium text-dark mb-1">
            {user.name}
          </h2>
          <p className="text-fluid-xxs text-dark/50">
            Manage your professional information and public presence
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Artist Name */}
        <div className="group">
          <label className="block text-fluid-xxs font-normal text-dark/50 mb-2">
            Gallery Name
          </label>
          <input
            type="text"
            disabled
            value={data.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-line disabled:cursor-not-allowed disabled:text-dark/30 rounded text-fluid-xxs text-dark 
                     focus:border-dark focus:outline-none focus:ring-0
                     transition-all duration-300"
            placeholder="Enter your artist name"
          />
        </div>

        {/* Email */}
        <div className="group">
          <label className="block text-fluid-xxs font-normal text-dark/50 mb-2">
            Email Address
          </label>
          <input
            type="email"
            disabled
            value={profile.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-line disabled:cursor-not-allowed disabled:text-dark/30 rounded text-fluid-xxs text-dark 
                     focus:border-dark focus:outline-none focus:ring-0 
                     transition-all duration-300"
            placeholder="your@email.com"
          />
        </div>
        {/* Admin */}
        <div className="group">
          <label className="block text-fluid-xxs font-normal text-dark/50 mb-2">
            Gallery Admin
          </label>
          <input
            type="text"
            value={data.admin}
            onChange={(e) => handleInputChange("admin", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-line disabled:cursor-not-allowed disabled:text-dark/30 rounded text-fluid-xxs text-dark 
                     focus:border-dark focus:outline-none focus:ring-0 
                     transition-all duration-300"
            placeholder="Admin name"
          />
        </div>

        {/* Address */}
        <div className="group">
          <label className="block text-fluid-xxs font-normal text-dark/50 mb-2">
            Gallery Address
          </label>
          <div className="flex items-center justify-between p-4 bg-gray-800 border border-line rounded">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-dark/50 mt-1" />
              <div>
                <p className="text-fluid-xxs text-dark">
                  {profile.address.address_line}
                </p>
                <p className="text-fluid-xxs text-dark/50">
                  {profile.address.city}, {profile.address.state}, {}
                  {profile.address.zip}
                </p>
              </div>
            </div>
            <button
              onClick={() => updateAddressModalPopup(true)}
              className="px-4 py-2 bg-dark  rounded hover:bg-dark/80 text-white 
                       transition-all duration-300 text-fluid-xxs font-normal"
            >
              Update Address
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="group">
          <label className="block text-fluid-xxs font-normal text-dark/50 mb-2">
            Gallery Description
          </label>
          <textarea
            value={data.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-line rounded text-fluid-xxs text-dark 
                     focus:border-dark focus:outline-none focus:ring-0 
                     transition-all duration-300 resize-none"
            placeholder="Tell us a little about the gallery"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-line">
        <button
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded font-normal text-fluid-xxs
                    transition-all duration-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-dark/30 ${
                      hasChanges
                        ? "bg-dark text-white hover:bg-dark/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-gray-400 text-gray-light cursor-not-allowed"
                    }`}
        >
          {loading ? (
            <LoadSmall />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>{" "}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
