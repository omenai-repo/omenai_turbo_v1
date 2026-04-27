"use client";

import React, { ChangeEvent, useState } from "react";
import EditorialCover from "./EditorialCover";
import { EditorialContentEditor } from "./EditorialContentEditor";
import { EditorialSchemaTypes } from "@omenai/shared-types";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { uploadEditorialImage } from "../../lib/uploadEditorialImage";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { useRouter } from "next/navigation";
import { deleteEditorialImage } from "../../lib/deleteEditorialImage";
import { useQueryClient } from "@tanstack/react-query";
import { useRollbar } from "@rollbar/react";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { updateEditorialPiece } from "../../lib/updateEditorial";

export default function EditorialForm({
  article,
}: Readonly<{
  article: EditorialSchemaTypes & { $id: string };
}>) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const rollbar = useRollbar();
  const [cover, setCover] = useState<File | null>(null);
  const [data, setData] = useState<{ headline: string; summary?: string }>({
    headline: article.headline,
    summary: article.summary,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const existingCoverUrl = article.cover
    ? getEditorialFileView(article.cover, 600)
    : null;
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name = e.target.name as "headline" | "summary";
    setData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleEditorialUpload = async (content: string) => {
    try {
      const hasCover = !!article.cover || !!cover;
      if (!content || !hasCover || !data.headline) {
        toast_notif(
          "Please complete the headline, cover image, and content before publishing.",
          "error",
        );
        return;
      }
      setLoading(true);
      let finalCoverFileId: string;
      if (cover) {
        const response = await uploadEditorialImage(cover);
        if (!response.isOk || !response.data) {
          toast_notif(response.message || "Image upload failed.", "error");
          return;
        }
        finalCoverFileId = response.data.$id;

        // If the user had an old cover and replaced it, delete the old one now.
        if (article.cover && article.cover !== finalCoverFileId) {
          await deleteEditorialImage(article.cover).catch((err) => {
            rollbar.error(err instanceof Error ? err : new Error(String(err)), {
              context: "delete_old_cover",
            });
          });
        }
      } else {
        // No new file — keep whichever existing cover ID is still set.
        finalCoverFileId = article.cover!;

        // If the original cover was removed and no new one was provided,
        // the guard above would have already returned, so we're safe here.
      }

      const editorialData: EditorialSchemaTypes = {
        cover: finalCoverFileId,
        content,
        slug: generateAlphaDigit(8),
        ...data,
        date: new Date(),
      };

      const updateEditorial = await updateEditorialPiece(
        article.$id,
        editorialData,
      );

      if (!updateEditorial.isOk) {
        // If we just uploaded a brand-new cover, roll it back.
        if (cover) {
          await deleteEditorialImage(finalCoverFileId);
        }
        toast_notif(
          updateEditorial.message || "Failed to publish editorial.",
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
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center space-y-6 pt-4">
          <input
            type="text"
            name="headline"
            placeholder="Editorial Headline"
            onChange={handleInputChange}
            value={data.headline}
            required
            className="w-full text-3xl lg:text-4xl font-normal tracking-tight text-neutral-900 placeholder:text-neutral-400 bg-transparent border border-neutral-200 focus:border-dark outline-none focus:ring-0 rounded transition-all duration-300 py-2"
          />

          <textarea
            name="summary"
            placeholder="Write a brief, captivating summary (Optional)"
            onChange={handleInputChange}
            value={data.summary}
            rows={4}
            className="w-full text-xl font-normal text-neutral-600 placeholder:text-neutral-400 resize-none bg-transparent border border-neutral-200 focus:border-dark outline-none focus:ring-0 rounded transition-all duration-300 py-2"
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <div className="h-full min-h-[280px] w-full rounded-xl bg-neutral-50/50 border border-neutral-200 hover:border-neutral-300 transition-colors overflow-hidden group flex flex-col relative">
            <EditorialCover
              cover={cover}
              setCover={setCover}
              existingCoverUrl={existingCoverUrl}
            />
          </div>
        </div>
      </section>
      <div className="w-full h-px bg-neutral-100" />
      <section className="w-full">
        <EditorialContentEditor
          handleEditorialUpload={handleEditorialUpload}
          loading={loading}
          article={article}
        />
      </section>
    </div>
  );
}
