"use client";
import { FormEvent } from "react";
import FormController from "./FormController";
import { registerAccount } from "@omenai/shared-services/register/registerAccount";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { storage } from "@omenai/appwrite-config/appwrite";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
import uploadArtistLogoContent from "../../uploadArtistLogo";
import { artist_countries_codes_currency } from "@omenai/shared-json/src/artist_onboarding_countries";
export default function FormInput() {
  const { artistSignupData, setIsLoading, clearData } = useArtistAuthStore();

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (allKeysEmpty(artistSignupData)) {
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
      country,
      logo,
      address_line,
      countryCode,
      state,
      city,
      zip,
      art_style,
      stateCode,
      base_currency,
      phone,
    } = artistSignupData;

    if (logo === null) return;

    const fileUploaded = await uploadArtistLogoContent(logo);

    if (fileUploaded) {
      let file: { bucketId: string; fileId: string } = {
        bucketId: fileUploaded.bucketId,
        fileId: fileUploaded.$id,
      };

      const payload = {
        name,
        email,
        password,
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
        base_currency,
        art_style,
        logo: file.fileId,
      };

      const response = await registerAccount(payload, "artist");

      if (response.isOk) {
        toast.success("Operation successful", {
          description: response.body.message + " redirecting...",
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });

        router.push(`/verify/artist/${response.body.data}`);
        clearData();
      } else {
        await storage.deleteFile(
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
