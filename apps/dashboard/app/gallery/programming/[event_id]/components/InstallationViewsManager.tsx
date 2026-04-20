import React, { useState } from "react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
// IMPORT YOUR APPWRITE UPLOAD FUNCTION HERE (e.g., uploadFileToStorage)
// import { uploadFileToStorage } from "@omenai/shared-services/storage/appwriteStorage";
import { updateInstallationViews } from "@omenai/shared-services/gallery/events/updateInstallationViews";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import uploadEventImage from "../../script/uploadEventCoverImage";
import { Models } from "appwrite";
import { InstallationViewsUploadModal } from "./InstallationViewsUploadModal";
import { storage } from "@omenai/appwrite-config";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { ConfirmActionModal } from "./ConfirmActionModal";
interface InstallationViewsManagerProps {
  eventId: string;
  galleryId: string;
  existingViews: string[];
  onUploadSuccess: () => void;
}

export const InstallationViewsManager = ({
  eventId,
  galleryId,
  existingViews = [],
  onUploadSuccess,
}: InstallationViewsManagerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { csrf } = useAuth({ requiredRole: "gallery" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewToDelete, setViewToDelete] = useState<string | null>(null);

  const confirmRemoval = async () => {
    if (!viewToDelete) return;

    const fileId = viewToDelete;
    setViewToDelete(null); // Close the modal instantly
    setDeletingId(fileId); // Lock the image overlay in the "Removing..." state

    try {
      // 1. Delete from Appwrite Bucket first to prevent orphaned data
      await storage.deleteFile({
        bucketId: process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
        fileId: fileId,
      });

      // 2. Remove the ID from MongoDB
      const response = await updateInstallationViews(
        eventId,
        galleryId,
        fileId,
        "remove",
        csrf || "",
      );

      if (response.isOk) {
        toast_notif("Image removed successfully.", "success");
        onUploadSuccess(); // Refreshes React Query to update the UI grid instantly
      } else {
        toast_notif(response.message, "error");
      }
    } catch (error) {
      console.error("Deletion failed:", error);
      toast_notif("Failed to delete image. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadFiles = async (files: File[]) => {
    setIsUploading(true);

    try {
      const uploadPromises = files.map((file: File) => {
        const fileUploaded = uploadEventImage(file);
        if (!fileUploaded) {
          throw new Error("Image upload failed");
        }
        return fileUploaded;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const uploadedUrlStrings = uploadedUrls.map((upload) => {
        if (!upload || !upload.$id || !upload.bucketId) {
          throw new Error("Image upload failed");
        }
        const file = {
          bucketId: upload.bucketId,
          fileId: upload.$id,
        };

        return file.fileId;
      });

      // 2. Save the array of URLs to MongoDB
      const response = await updateInstallationViews(
        eventId,
        galleryId,
        uploadedUrlStrings,
        "add",
        csrf || "",
      );

      if (response.isOk) {
        toast_notif("Installation views added successfully.", "success");
        onUploadSuccess(); // Refreshes the dashboard
        setIsModalOpen(false); // Close the modal on success
      } else {
        // Implement deleting the uploaded files from storage here if the database update fails, to prevent orphaned files
        // Rollback: Delete all uploaded images from Appwrite to prevent orphaned data
        const deletePromises = uploadedUrlStrings.map((fileId) =>
          storage
            .deleteFile({
              bucketId: process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
              fileId,
            })
            .catch((err) => {
              console.error(`Failed to cleanup orphaned file ${fileId}:`, err);
            }),
        );

        await Promise.all(deletePromises);

        toast_notif(
          response.message ||
            "An error occurred while updating the presentation. Please try again.",
          "error",
        );
        return;
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast_notif("Failed to upload images.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6 pt-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-normal text-dark">Installation Views</h2>
          <p className="text-xs text-neutral-500 tracking-wide mt-1">
            Provide spatial context with in-room photography.
          </p>
        </div>

        {/* Simplified Button: Just opens the modal now! */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-300 rounded-sm border border-neutral-200 bg-white text-dark hover:border-dark shadow-sm flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Add Images
        </button>
      </div>

      {/* The Gallery Grid (Existing Views) */}
      {existingViews.length === 0 ? (
        <div className="w-full h-48 bg-neutral-50 border border-dashed border-neutral-300 flex flex-col items-center justify-center rounded-sm">
          <svg
            className="w-8 h-8 text-neutral-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-neutral-500 tracking-wide">
            No installation views uploaded yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {existingViews.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] bg-neutral-100 overflow-hidden rounded-sm border border-neutral-200 group"
            >
              <img
                src={getPromotionalOptimizedImage(url, "small")}
                alt={`Installation View ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className={`absolute inset-0 bg-white/80 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] ${
                  deletingId === url
                    ? "opacity-100 z-10"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setViewToDelete(url)}
                  disabled={deletingId === url}
                  className="px-4 py-2 bg-red-600 text-white text-[10px] font-medium tracking-widest uppercase rounded-sm hover:bg-red-700 transition-colors disabled:bg-neutral-400 shadow-sm flex items-center gap-2"
                >
                  {deletingId === url ? (
                    "Removing..."
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* The New Modal */}
      <InstallationViewsUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isUploading={isUploading}
        onConfirmUpload={handleUploadFiles}
      />
      <ConfirmActionModal
        isOpen={!!viewToDelete}
        title="Remove Installation View"
        message="Are you sure you want to remove this installation view from your presentation? This action cannot be undone."
        confirmText="Remove Image"
        isDestructive={true}
        onConfirm={confirmRemoval}
        onCancel={() => setViewToDelete(null)}
      />
    </div>
  );
};
