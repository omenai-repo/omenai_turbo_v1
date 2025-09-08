"use client";
import { FormEvent, useState } from "react";
import { InputCard } from "./InputCard";
import { updateProfile } from "@omenai/shared-services/update/updateProfile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { galleryProfileUpdate } from "@omenai/shared-state-store/src/gallery/gallery_profile_update/GalleryProfileUpdateStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export const FormCard = () => {
  const { user, csrf } = useAuth({ requiredRole: "artist" });

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const { updateData, clearData } = galleryProfileUpdate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const { isOk, body } = await updateProfile(
      "artist",
      updateData,
      user?.artist_id as string,
      csrf || ""
    );
    if (!isOk)
      toast.error("Error notification", {
        description: body.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else {
      toast.success("Operation successful", {
        description: `${body.message}... Please log back in`,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      setIsLoading(false);
      clearData();
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-8 lg:px-2">
      <div className="w-fit flex flex-col space-y-4">
        <InputCard
          label="Name"
          value={user?.name}
          onChange={() => {}}
          labelText="artist"
          disabled={false}
        />
        <InputCard
          label="Email address"
          value={user?.email}
          labelText="email"
          disabled
          rightComponent={
            <div>
              {user?.verified ? (
                <p className="text-green-400">Verified</p>
              ) : (
                <p className="text-red-500">Verify</p>
              )}
            </div>
          }
        />

        {/* <InputCard
          label="Address"
          defaultValue={
            user?.address?.address_line as ArtistSchemaTypes["address"]
          }
          labelText="location"
          disabled
        /> */}
      </div>

      <button
        type="submit"
        disabled={
          (!updateData.admin &&
            !updateData.location &&
            !updateData.description) ||
          isLoading
        }
        className="h-[35px] p-5 rounded-md w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
      >
        {isLoading ? <LoadSmall /> : "Save edit data"}
      </button>
    </form>
  );
};
