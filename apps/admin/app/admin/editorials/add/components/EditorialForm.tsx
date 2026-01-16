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
    const name = e.target.name as "headline" | "summary";
    setData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleEditorialUpload = async (content: string) => {
    try {
      if (!content || !cover || !data.headline) {
        toast_notif(
          "Please complete the headline, cover image, and content before publishing.",
          "error"
        );
        return;
      }

      setLoading(true);

      const response = await uploadEditorialImage(cover);
      if (!response.isOk || !response.data) {
        toast_notif(response.message || "Image upload failed.", "error");
        return;
      }

      const file = {
        bucketId: response.data.bucketId,
        fileId: response.data.$id,
      };

      const editorialData: EditorialSchemaTypes = {
        cover: file.fileId,
        content,
        slug: generateAlphaDigit(8),
        ...data,
        date: new Date(),
      };

      const uploadEditorial = await createEditorialPiece(editorialData);

      if (!uploadEditorial.isOk) {
        await deleteEditorialImage(file.fileId);
        toast_notif(
          uploadEditorial.message || "Failed to publish editorial.",
          "error"
        );
        return;
      }

      toast_notif("Editorial published successfully", "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_admin_editorials"],
      });

      router.replace("/admin/editorials");
    } catch (err) {
      rollbar.error(err instanceof Error ? err : new Error(String(err)));
      toast_notif("Something went wrong, please contact support.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Metadata */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-neutral-900">
            Editorial details
          </h3>
          <p className="text-sm text-neutral-500">
            Title, summary, and cover image used for discovery.
          </p>
        </div>

        <TextInput
          label="Headline"
          placeholder="Enter the title of this editorial"
          onChange={handleInputChange}
          name="headline"
          required
        />

        <TextInput
          label="Summary (optional)"
          placeholder="Short description shown in previews"
          onChange={handleInputChange}
          name="summary"
        />

        <EditorialCover cover={cover} setCover={setCover} />
      </section>

      {/* Content */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-neutral-900">
            Editorial content
          </h3>
          <p className="text-sm text-neutral-500">
            Write the full editorial article below.
          </p>
        </div>

        <EditorialContentEditor
          handleEditorialUpload={handleEditorialUpload}
          loading={loading}
        />
      </section>
    </div>
  );
}
