"use client";
import { FormEvent, useContext, useState } from "react";
import { InputCard } from "./InputCard";
import { TextareaCard } from "./TextareaCard";
import { updateProfile } from "@omenai/shared-services/update/updateProfile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { galleryProfileUpdate } from "@omenai/shared-state-store/src/gallery/gallery_profile_update/GalleryProfileUpdateStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { ArtistSchemaTypes, GallerySchemaTypes } from "@omenai/shared-types";

export const FormCard = () => {
  const { session } = useContext(SessionContext);

  const user = session as ArtistSchemaTypes;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const { updateData, clearData } = galleryProfileUpdate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const { isOk, body } = await updateProfile(
      "artist",
      updateData,
      user.artist_id as string
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
      // todo: Add session update fn
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
          value={user.name}
          onChange={() => {}}
          labelText="artist"
          disabled={false}
        />
        <InputCard
          label="Email address"
          value={user.email}
          labelText="email"
          disabled
          rightComponent={
            <div>
              {user.verified ? (
                <p className="text-green-400">Verified</p>
              ) : (
                <p className="text-red-500">Verify</p>
              )}
            </div>
          }
        />

        <InputCard
          label="Address"
          defaultValue={user.address.address_line}
          labelText="location"
          disabled
        />
      </div>

      <button
        type="submit"
        disabled={
          (!updateData.admin &&
            !updateData.location &&
            !updateData.description) ||
          isLoading
        }
        className="h-[35px] p-5 rounded-full w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
      >
        {isLoading ? <LoadSmall /> : "Save edit data"}
      </button>
    </form>
  );
};
