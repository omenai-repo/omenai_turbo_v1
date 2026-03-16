"use client";
import React, { FormEvent, useState } from "react";
import { updateArtwork } from "@omenai/shared-services/artworks/updateArtwork";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { deleteArtwork } from "@omenai/shared-services/artworks/deleteArtwork";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import {
  TEXTAREA_CLASS,
  BUTTON_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";

export default function EditArtworkWrapper({
  artwork,
}: {
  artwork: ArtworkSchemaTypes & { createdAt: string; updatedAt: string };
}) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [description, setDescription] = useState(
    artwork.artwork_description ?? "",
  );

  const { csrf } = useAuth({ requiredRole: "gallery" });
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (description.trim() === "") {
      toast_notif("Please fill in the description field to proceed", "error");
      return;
    }

    setLoading(true);
    try {
      const update = await updateArtwork(
        { artwork_description: description },
        artwork.art_id,
        csrf || "",
      );

      if (!update?.isOk) {
        toast_notif(update.message, "error");
      } else {
        toast_notif(update.message, "success");
        queryClient.invalidateQueries({ queryKey: ["fetch_artworks_by_id"] });
        router.replace("/gallery/artworks");
      }
    } catch (error) {
      toast_notif(
        "An error occurred. Please try again or contact support",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteUploadArtwork() {
    // Added a safeguard confirmation so users don't accidentally delete art
    const confirmed = window.confirm(
      "Are you sure you want to delete this artwork? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      const deleteArtworkData = await deleteArtwork(artwork.art_id, csrf || "");

      if (!deleteArtworkData?.isOk) {
        toast_notif(deleteArtworkData.message, "error");
      } else {
        toast_notif(deleteArtworkData.message, "success");
        queryClient.invalidateQueries({ queryKey: ["fetch_artworks_by_id"] });
        router.replace("/gallery/artworks");
      }
    } catch (error) {
      toast_notif(
        "An error occurred. Please try again or contact support",
        "error",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-3xl space-y-8 px-4 pb-12">
      {/* Page Header */}
      <div className="pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Edit Artwork
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Update the details of your artwork or remove it from your gallery.
        </p>
      </div>

      {/* Main Edit Form Card */}
      <div className="overflow-hidden rounded -xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h2 className="text-base font-medium text-slate-800">
            Artwork Description
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700"
            >
              Description details
            </label>
            <textarea
              name="description"
              id="description"
              rows={6}
              value={description}
              placeholder="Tell the story behind this piece..."
              onChange={(e) => setDescription(e.target.value)}
              // Appending to your existing class to ensure it looks pristine
              className={`${TEXTAREA_CLASS} w-full resize-y p-4 text-sm leading-relaxed focus:outline-none text-slate-800 transition-colors focus:border-dark focus:ring-dark`}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              disabled={
                loading || description.trim() === artwork.artwork_description
              }
              type="submit"
              className={`${BUTTON_CLASS} inline-flex min-w-[140px] items-center justify-center rounded -md bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400`}
            >
              {loading ? <LoadSmall /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone Card */}
      <div className="overflow-hidden rounded -xl border border-red-200 bg-red-50/30">
        <div className="px-6 py-6 sm:flex sm:items-center sm:justify-between">
          <div className="sm:pr-8">
            <h3 className="text-base font-medium text-red-800">Danger Zone</h3>
            <p className="mt-1 text-sm text-red-600/80">
              Permanently delete this artwork from your gallery. This action
              cannot be undone and will remove the piece from all public
              listings.
            </p>
          </div>
          <div className="mt-4 sm:ml-4 sm:mt-0 sm:shrink-0">
            <button
              onClick={deleteUploadArtwork}
              disabled={deleteLoading}
              type="button"
              className="inline-flex min-w-[140px] items-center justify-center rounded -md border border-red-200 bg-white px-6 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteLoading ? <LoadSmall /> : "Delete Artwork"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
