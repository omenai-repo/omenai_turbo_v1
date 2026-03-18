"use client";

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

  // Updated to accept both native input and textarea elements
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name = e.target.name as "headline" | "summary";
    setData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleEditorialUpload = async (content: string) => {
    try {
      if (!content || !cover || !data.headline) {
        toast_notif(
          "Please complete the headline, cover image, and content before publishing.",
          "error",
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
          "error",
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
    <div className="w-full flex flex-col space-y-12">
      {/* Top Section: Metadata & Cover Grid */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Custom Typography Inputs */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center space-y-6 pt-4">
          {/* Native Input for Headline */}
          <input
            type="text"
            name="headline"
            placeholder="Editorial Headline"
            onChange={handleInputChange}
            required
            className="w-full  text-3xl lg:text-4xl font-light tracking-tight text-neutral-900 placeholder:text-neutral-400 bg-transparent border border-neutral-200 focus:border-dark outline-none focus:ring-0 rounded transition-all duration-300 py-2"
          />

          {/* Native Textarea for Summary */}
          <textarea
            name="summary"
            placeholder="Write a brief, captivating summary (Optional)"
            onChange={handleInputChange}
            rows={4}
            className="w-full text-xl font-light text-neutral-600 placeholder:text-neutral-400 resize-none bg-transparent border border-neutral-200 focus:border-dark outline-none focus:ring-0 rounded transition-all duration-300 py-2"
          />
        </div>

        {/* Right Column: Cover Image Upload */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <div className="h-full min-h-[280px] w-full rounded-xl bg-neutral-50/50 border border-neutral-200 hover:border-neutral-300 transition-colors overflow-hidden group flex flex-col relative">
            {/* Note: Ensure your EditorialCover component takes full width/height of its parent */}
            <EditorialCover cover={cover} setCover={setCover} />
          </div>
        </div>
      </section>

      {/* Subtle Divider */}
      <div className="w-full h-px bg-neutral-100" />

      {/* Full Width Content Editor */}
      <section className="w-full">
        <EditorialContentEditor
          handleEditorialUpload={handleEditorialUpload}
          loading={loading}
        />
      </section>
    </div>
  );
}
