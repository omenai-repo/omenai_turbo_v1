"use client";
import { FormEvent } from "react";
import FormController from "./FormController";
import { registerAccount } from "@omenai/shared-services/register/registerAccount";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import uploadGalleryLogoContent from "../../uploadGalleryLogo";
import { gallery_logo_storage } from "@omenai/appwrite-config/appwrite";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";

export default function FormInput() {
  const { gallerySignupData, setIsLoading, clearData } = useGalleryAuthStore();

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading();

    const {
      name,
      email,
      password,
      admin,
      address,
      description,
      country,
      logo,
    } = gallerySignupData;

    if (logo === null) return;

    const fileUploaded = await uploadGalleryLogoContent(logo);

    if (fileUploaded) {
      let file: { bucketId: string; fileId: string } = {
        bucketId: fileUploaded.bucketId,
        fileId: fileUploaded.$id,
      };
      const payload = {
        name,
        email,
        password,
        admin,
        location: { address, country },
        description,
        logo: file.fileId,
      };

      const response = await registerAccount(payload, "gallery");

      if (response.isOk) {
        toast.success("Operation successful", {
          description: response.body.message + " redirecting...",
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });

        router.push(`/verify/gallery/${response.body.data}`);
        clearData();
      } else {
        await gallery_logo_storage.deleteFile(
          process.env.NEXT_PUBLIC_APPWRITE_GALLERY_LOGO_BUCKET_ID!,
          file.fileId
        );
        toast.error("Error notification", {
          description: response.body.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      }
      setIsLoading();
    }
  };
  return (
    <div className="container">
      <form
        className="flex flex-col justify-end gap-4 w-full container lg:px-[2rem] xl:px-[4rem] 2xl:px-[7rem]"
        onSubmit={handleSubmit}
      >
        <FormController />
      </form>
    </div>
  );
}
