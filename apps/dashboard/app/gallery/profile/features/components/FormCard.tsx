"use client";
import { FormEvent, useContext, useState } from "react";
import { InputCard } from "./InputCard";
import { TextareaCard } from "./TextareaCard";
import { updateProfile } from "@omenai/shared-services/update/updateProfile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { galleryProfileUpdate } from "@omenai/shared-state-store/src/gallery/gallery_profile_update/GalleryProfileUpdateStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export const FormCard = () => {
  const { user } = useAuth({ requiredRole: "gallery" });

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const { updateData, clearData } = galleryProfileUpdate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const { isOk, body } = await updateProfile(
      "gallery",
      updateData,
      user?.id as string
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
      <div className="grid grid-cols-2 items-center">
        <InputCard
          label="Name"
          value={user?.name}
          onChange={() => {}}
          labelText="gallery"
        />
        <InputCard
          label="Email address"
          value={user?.email}
          labelText="email"
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
      </div>

      <div className="grid grid-cols-2 items-center">
        <InputCard
          label="Address"
          defaultValue={user.address.address_line}
          labelText="location"
        />
        <InputCard
          label="Admin"
          defaultValue={user?.admin as string}
          labelText="admin"
        />
      </div>

      <TextareaCard
        label="Gallery description"
        rows={2}
        className="resize-none"
        defaultValue={user?.description as string}
        name="description"
      />

      <button
        type="submit"
        disabled={
          (!updateData.admin &&
            !updateData.location &&
            !updateData.description) ||
          isLoading
        }
        className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
      >
        {isLoading ? <LoadSmall /> : "Save edit data"}
      </button>
    </form>
  );
};
