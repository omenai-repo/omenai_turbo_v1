"use client";
import { Input, TextInput } from "@mantine/core";
import React, { ChangeEvent, useState } from "react";
import EditorialCover from "./EditorialCover";
import { EditorialContentEditor } from "./EditorialContentEditor";
import { EditorialSchemaTypes } from "@omenai/shared-types";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { uploadEditorialImage } from "../../lib/uploadEditorialImage";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { createEditorialPiece } from "../../lib/createEditorial";
import { useRouter } from "next/navigation";
import { deleteEditorialImage } from "../../lib/deleteEditorialImage";
import { useQueryClient } from "@tanstack/react-query";
import { useRollbar } from "@rollbar/react";
export default function EditorialForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const rollbar = useRollbar();
  const [cover, setCover] = useState<File | null>(null);
  const [data, setData] = useState<{ headline: string; summary?: string }>({
    headline: "",
    summary: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof { headline: string; summary: string };
    const value = e.target.value;

    setData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleEditorialUpload = async (content: string) => {
    try {
      if (!content || !cover || !data.headline) {
        toast_notif(
          "Invalid upload parameters, please ensure all fields are filled",
          "error"
        );
        return;
      }
      setLoading(true);

      // Upload image
      const response = await uploadEditorialImage(cover);

      if (!response.isOk) {
        toast_notif(
          response.message || "Something went wrong, please contact IT support",
          "error"
        );
      }

      if (!response.data) {
        toast_notif(
          response.message || "Image upload failed, please contact IT support",
          "error"
        );

        return;
      }

      const date = new Date();
      const file = {
        bucketId: response.data.bucketId,
        fileId: response.data.$id,
      };
      const editorial_data: EditorialSchemaTypes = {
        cover: file.fileId,
        content,
        slug: generateAlphaDigit(8),
        ...data,
        date,
      };

      const upload_editorial = await createEditorialPiece(editorial_data);

      if (!upload_editorial.isOk) {
        await deleteEditorialImage(file.fileId);
        toast_notif(
          upload_editorial.message ||
            "Something went wrong, contact IT support",
          "error"
        );

        return;
      }

      toast_notif("Editorial upload successful", "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_admin_editorials"],
      });
      router.replace("/admin/editorials");
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif("Something went wrong, please contact IT support", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      <TextInput
        label="Editorial Headline"
        placeholder="Eter the title for this editorial"
        onChange={handleInputChange}
        name="headline"
      />
      <TextInput
        label="Editorial summary (optional)"
        placeholder="Enter a summary for this editorial"
        onChange={handleInputChange}
        name="summary"
      />

      <EditorialCover cover={cover} setCover={setCover} />

      <div className="my-6">
        <Input.Label required>Write your editorial content</Input.Label>
        <EditorialContentEditor
          handleEditorialUpload={handleEditorialUpload}
          loading={loading}
        />
      </div>
    </div>
  );
}
