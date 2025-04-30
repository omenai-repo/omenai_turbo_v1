"use client";
import React, { ChangeEvent, FormEvent, useContext, useState } from "react";
import { AdminUploadInput } from "./components/Input";
import ImageUpload from "./components/ImageUpload";
import { toast } from "sonner";
import uploadPromotionalContentImage from "../controller/uploadPromotionalCoverImage";
import { createPromotionalData } from "@omenai/shared-services/promotionals/createPromotionalData";
import { promotional_storage } from "@omenai/appwrite-config/appwrite";
import { useQueryClient } from "@tanstack/react-query";
import { PromotionalSchemaTypes, UserType } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRouter } from "next/navigation";
import { checkSession } from "@omenai/shared-utils/src/checkSessionValidity";
export default function Upload() {
  const queryClient = useQueryClient();
  const [cover, setCover] = useState<File | null>(null);

  const [upload_data, set_upload_data] = useState<
    Omit<PromotionalSchemaTypes, "image">
  >({
    headline: "",
    subheadline: "",
    cta: "",
  });
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    set_upload_data((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const acceptedFileTypes = ["jpg", "jpeg", "png", "webp"];

  async function handlePromotionalContentUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const session = await checkSession();

    if (!session) {
      toast.error("Error notification", {
        description: "Admin session expired. Please login again",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      router.replace("/auth/login/secure/admin");
      return;
    }

    if (
      upload_data.cta === "" ||
      upload_data.headline === "" ||
      upload_data.subheadline === "" ||
      cover === null
    ) {
      toast.error("Error notification", {
        description:
          "Invalid input parameters, Please fill in all the fields to upload",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } else {
      setLoading(true);
      const type = cover.type.split("/");

      if (!acceptedFileTypes.includes(type[1].toLowerCase())) {
        toast.error("Error notification", {
          description:
            "File type unsupported. Supported file types are: JPEG, JPG, and PNG",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        setLoading(false);

        return;
      }
      const fileUploaded = await uploadPromotionalContentImage(cover);

      if (fileUploaded) {
        let file: { bucketId: string; fileId: string } = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };

        const data = {
          ...upload_data,
          image: file.fileId,
        };

        const upload_response = await createPromotionalData(data);
        if (!upload_response?.isOk) {
          await promotional_storage.deleteFile(
            process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
            file.fileId
          );
          toast.error("Error notification", {
            description: upload_response?.message,
            style: {
              background: "red",
              color: "white",
            },
            className: "class",
          });
          setCover(null);
          setLoading(false);
        } else {
          setLoading(false);
          toast.success("Operation successful", {
            description: upload_response.message,
            style: {
              background: "green",
              color: "white",
            },
            className: "class",
          });
          queryClient.invalidateQueries();
          set_upload_data({ headline: "", subheadline: "", cta: "" });
          setCover(null);
        }
      } else {
        toast.error("Error notification", {
          description:
            "Error uploading cover image. Please try again or contact IT support",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      }
    }
    setLoading(false);
  }

  return (
    <div className="md:container">
      <form onSubmit={handlePromotionalContentUpload}>
        <div className=" mt-5 mb-[3rem]">
          <h1 className="divide-y text-fluid-sm text-dark">
            Create a promotional content
          </h1>
        </div>

        <AdminUploadInput
          label={"Headline"}
          name={"headline"}
          handleChange={handleInputChange}
          value={upload_data.headline}
        />

        <AdminUploadInput
          label={"Sub headline"}
          name={"subheadline"}
          handleChange={handleInputChange}
          value={upload_data.subheadline}
        />

        <AdminUploadInput
          label={"Call to action (A link to the promotional resource)"}
          name={"cta"}
          handleChange={handleInputChange}
          value={upload_data.cta}
        />

        <div className="flex flex-col gap-3">
          <label htmlFor="Cover" className="text-fluid-xs">
            Cover image
          </label>
          <label
            htmlFor="label_description"
            className="text-fluid-xs text-red-600 font-semibold"
          >
            Note: Uploading a landscaped or square-shaped image would be most
            ideal for display
          </label>
        </div>
        <ImageUpload cover={cover} setCover={setCover} />

        <div className="flex flex-col gap-3 my-4">
          <button
            disabled={loading}
            type="submit"
            className={`whitespace-nowrap bg-dark text-fluid-xs disabled:bg-dark/10 disabled:text-[#858585] rounded-sm w-full text-white disabled:cursor-not-allowed h-[35px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80 `}
          >
            {loading ? <LoadSmall /> : "Upload promotional content"}
          </button>
        </div>
      </form>
    </div>
  );
}
