"use client";
import { FormEvent } from "react";
import FormController from "./FormController";
import { registerAccount } from "@omenai/shared-services/register/registerAccount";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import uploadGalleryLogoContent from "../../uploadGalleryLogo";
import { logo_storage } from "@omenai/appwrite-config/appwrite";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
export default function FormInput() {
  const { gallerySignupData, setIsLoading, clearData } = useGalleryAuthStore();

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (allKeysEmpty(gallerySignupData)) {
      toast.error("Error notification", {
        description: "All form fields must be filled out before submission.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }

    setIsLoading();

    const {
      name,
      email,
      password,
      admin,
      description,
      country,
      logo,
      address_line,
      countryCode,
      state,
      city,
      zip,
      stateCode,
      phone,
    } = gallerySignupData;

    console.log(gallerySignupData);

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
        address: {
          address_line,
          country,
          countryCode,
          state,
          city,
          zip,
          stateCode,
        },
        phone,
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
        await logo_storage.deleteFile(
          process.env.NEXT_PUBLIC_APPWRITE_LOGO_BUCKET_ID!,
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
    <div className="">
      <form
        className="flex flex-col justify-end gap-4 w-full"
        onSubmit={handleSubmit}
      >
        <FormController />
      </form>
    </div>
  );
}
