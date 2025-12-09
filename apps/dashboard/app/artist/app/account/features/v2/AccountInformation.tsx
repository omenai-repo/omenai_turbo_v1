"use client";
// Tab Components
import React, { useState } from "react";
import { Camera, MapPin, Save } from "lucide-react";
import Image from "next/image";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { updateProfile } from "@omenai/shared-services/update/updateProfile";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRollbar } from "@rollbar/react";
import {INPUT_CLASS, TEXTAREA_CLASS} from "@omenai/shared-ui-components/components/styles/inputClasses";

export default function AccountInformation({ profile }: any) {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const { updateAddressModalPopup, updateLogoModalPopup } = artistActionStore();
  const [loading, setLoading] = useState(false);
  const rollbar = useRollbar();
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  // Form state
  const [data, setData] = useState<any>({
    name: profile.name,
    bio: profile.bio,
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
        "artist",
        data,
        user.artist_id,
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
    <div className="space-y-4 animate-fadeIn">
      {/* Logo Section */}
      <div className="flex items-start space-x-4 pb-4 border-line">
        <div className="relative group px-4">
          <Image
            src={image_url}
            alt="Artist Logo"
            className="object-cover w-[100px] h-[100px] rounded-full"
            height={100}
            width={100}
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
          <label
            htmlFor="name"
            className="block text-fluid-xxs font-normal text-dark/50 mb-2"
          >
            Artist Name
          </label>
          <input
            type="text"
            disabled
            name="name"
            value={data.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={INPUT_CLASS}
            placeholder="Enter your artist name"
          />
        </div>

        {/* Email */}
        <div className="group">
          <label
            htmlFor="email"
            className="block text-fluid-xxs font-normal text-dark/50 mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            name="email"
            disabled
            value={profile.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={INPUT_CLASS}
            placeholder="your@email.com"
          />
        </div>

        {/* Address */}
        <div className="group">
          <label
            htmlFor="address"
            className="block text-fluid-xxs font-normal text-dark/50 mb-2"
          >
            Artist Address
          </label>
          <div className="flex items-center justify-between p-4 bg-gray-800 border border-line rounded-2xl">
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
              className="px-4 py-2 bg-dark  rounded-full hover:bg-dark/80 text-white 
                       transition-all duration-300 text-fluid-xxs font-normal"
            >
              Update Address
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="group">
          <label
            htmlFor="Biography"
            className="block text-fluid-xxs font-normal text-dark/50 mb-2"
          >
            Artist Biography
          </label>
          <textarea
            value={data.bio}
            name="Biography"
            onChange={(e) => handleInputChange("bio", e.target.value)}
            rows={6}
            className={TEXTAREA_CLASS}
            placeholder="Tell us about your artistic journey..."
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-line">
        <button
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full font-normal text-fluid-xxs
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
