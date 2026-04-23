"use client";

import React, { useState } from "react";
import {
  CreateGalleryEventPayload,
  GalleryEventValidationSchema,
} from "@omenai/shared-lib/zodSchemas/GalleryEventValidationSchema";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { DynamicEventFields } from "./DynamicEventFields";
import { ArtworkSelectorModal } from "./ArtworkSelectorModal";
import { createEvent } from "@omenai/shared-services/gallery/events/createEvent";
import { useRouter } from "next/navigation";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { CoverImageUploader } from "./CoverImageUploader";
import { PremiumDateInput } from "../components/PremiumDateInput";
import uploadEventCoverImage from "../script/uploadEventCoverImage";
import { storage } from "@omenai/appwrite-config";
import { InstallationViewsUploader } from "./InstallationViewsUploader";
const EVENT_TYPES = [
  { id: "exhibition", label: "Gallery Exhibition" },
  { id: "art_fair", label: "Art Fair Presentation" },
  { id: "viewing_room", label: "Digital Viewing Room" },
] as const;

export const CreateGalleryEventForm = () => {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [installationFiles, setInstallationFiles] = useState<File[]>([]);

  // File State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pendingPayload, setPendingPayload] =
    useState<CreateGalleryEventPayload | null>(null);

  const router = useRouter();

  // 1. Native React State for Form Data
  const [formData, setFormData] = useState<any>({
    gallery_id: user.gallery_id,
    event_type: "exhibition",
    title: "",
    description: "",
    cover_image: "",
    start_date: "",
    end_date: "",
    location: { venue: "", city: "", country: "" },
    vip_preview_date: null,
    booth_number: "",
    featured_artworks: [],
    participating_artists: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));

    if (field.startsWith("location.")) {
      const key = field.split(".")[1];
      setFormData((prev: any) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleFileSelect = (file: File) => {
    setCoverFile(file);
    setErrors((prev) => ({ ...prev, cover_image: "" }));
    // Create local preview URL immediately for the UI
    const localUrl = URL.createObjectURL(file);
    handleChange("cover_image", localUrl);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if image is selected
    if (!coverFile) {
      setErrors({ cover_image: "A cover image is required." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const payloadToValidate = { ...formData };
    if (!payloadToValidate.start_date) delete payloadToValidate.start_date;
    if (!payloadToValidate.end_date) delete payloadToValidate.end_date;
    if (!payloadToValidate.vip_preview_date)
      delete payloadToValidate.vip_preview_date;

    // Inject temporary dummy URL to safely bypass Zod's .url() requirement during this step
    payloadToValidate.cover_image =
      "https://appwrite-pending.omenai.com/image.jpg";

    const validationResult =
      GalleryEventValidationSchema.safeParse(payloadToValidate);

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        newErrors[path] = issue.message;
      });
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const validPayload: CreateGalleryEventPayload = validationResult.data;
    setPendingPayload(validPayload);
    setIsModalOpen(true);
    setIsSubmitting(false);
  };

  const executeFinalSubmission = async (
    finalPayload: CreateGalleryEventPayload,
  ) => {
    if (!coverFile) return;

    // Tracker to hold ALL uploaded files so we can roll them back if MongoDB fails
    const uploadedFilesTracker: { bucketId: string; fileId: string }[] = [];

    try {
      // 1. Upload Cover Image
      const coverUpload = await uploadEventCoverImage(coverFile);

      if (!coverUpload) {
        throw new Error("Cover image upload failed");
      }

      // Track the cover image
      uploadedFilesTracker.push({
        bucketId: coverUpload.bucketId,
        fileId: coverUpload.$id,
      });

      // 2. Upload Installation Views (If any were added)
      const installationViewIds: string[] = [];

      // Assumes you added the `installationFiles` state from the previous step!
      if (installationFiles && installationFiles.length > 0) {
        // We reuse your upload function for the installation files
        const installPromises = installationFiles.map((file) =>
          uploadEventCoverImage(file),
        );
        const installUploads = await Promise.all(installPromises);

        installUploads.forEach((upload) => {
          if (upload) {
            uploadedFilesTracker.push({
              bucketId: upload.bucketId,
              fileId: upload.$id,
            });
            installationViewIds.push(upload.$id);
          }
        });
      }

      // 3. Overwrite the dummy validation URL with the secure Appwrite file IDs
      const dbPayload = {
        ...finalPayload,
        cover_image: uploadedFilesTracker[0].fileId, // Cover is always first
        installation_views: installationViewIds, // Array of the rest
      };

      console.log("FINAL PAYLOAD GOING TO DB:", dbPayload);

      // 4. Save Event
      const response = await createEvent(dbPayload, csrf || "");

      if (!response.isOk) {
        // THE ROLLBACK: Loop through the tracker and delete every orphaned image
        const deletePromises = uploadedFilesTracker.map((file) =>
          storage
            .deleteFile({
              bucketId: process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
              fileId: file.fileId,
            })
            .catch((err) => {
              // Catch individual errors so one fail doesn't stop the rest from deleting
              console.error(
                `Failed to cleanup orphaned file ${file.fileId}:`,
                err,
              );
            }),
        );

        await Promise.all(deletePromises);

        toast_notif(
          response.message ||
            "An error occurred while creating the event. Please try again.",
          "error",
        );
        return;
      }

      toast_notif("Event successfully published.", "success");
      router.push("/gallery/programming");
    } catch (error) {
      console.error(error);

      // FAILSAFE ROLLBACK: If the network drops or code crashes midway, clean up whatever made it to Appwrite
      if (uploadedFilesTracker.length > 0) {
        const deletePromises = uploadedFilesTracker.map((file) =>
          storage
            .deleteFile({
              bucketId: process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
              fileId: file.fileId,
            })
            .catch((err) =>
              console.error(`Failsafe cleanup error for ${file.fileId}:`, err),
            ),
        );
        await Promise.all(deletePromises);
      }

      toast_notif("An error occurred during final submission.", "error");
    }
  };

  return (
    <div className="w-full max-w-full mx-auto py-6">
      <div className="mb-12">
        <h1 className="text-3xl font-normal tracking-tight text-dark mb-2">
          Curate Event
        </h1>
        <p className="text-sm text-neutral-500 tracking-wide">
          Define the specifics of your upcoming programming.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-12">
        {/* Cover Image Uploader Component */}
        <CoverImageUploader
          currentImageUrl={formData.cover_image}
          error={errors.cover_image}
          onFileSelect={handleFileSelect}
        />

        <InstallationViewsUploader
          files={installationFiles}
          onFilesChange={setInstallationFiles}
        />

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-4">
            Event Format
          </label>
          <div className="flex flex-wrap gap-4">
            {EVENT_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleChange("event_type", type.id)}
                className={`px-6 py-3 text-xs tracking-widest uppercase transition-all duration-300 rounded-sm border ${
                  formData.event_type === type.id
                    ? "bg-dark text-white border-dark"
                    : "bg-transparent text-neutral-500 border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Details */}
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
              Presentation Title
            </label>
            <input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Neon Reverie: New Works"
              className="w-full bg-transparent border-0 border-b border-neutral-300 py-3 text-2xl font-light text-dark placeholder-neutral-300 placeholder:font-light focus:border-dark focus:ring-0 outline-none transition-colors"
            />
            {errors.title && (
              <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-8">
            <div className="w-full">
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                Opening Date
              </label>
              <PremiumDateInput
                value={formData.start_date}
                onChange={(val: string) => handleChange("start_date", val)}
                placeholder="SELECT OPENING DATE"
                error={errors.start_date}
                disablePastDates={true}
              />
            </div>
            <div className="w-full">
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                Closing Date
              </label>

              <PremiumDateInput
                value={formData.end_date}
                onChange={(val: string) => handleChange("end_date", val)}
                placeholder="SELECT CLOSING DATE"
                error={errors.end_date}
                disablePastDates={true}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
              Curatorial Statement
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={10}
              placeholder="Provide a detailed overview of the presentation..."
              className="w-full bg-transparent border border-neutral-200 p-6 text-sm text-neutral-900 placeholder-neutral-400 focus:border-dark focus:ring-0 outline-none transition-colors rounded-sm  resize-none"
            />
            {errors.description && (
              <p className="text-[10px] text-red-500 mt-1">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Context Fields */}
        <DynamicEventFields
          currentType={formData.event_type}
          formData={formData}
          errors={errors}
          onChange={handleChange}
        />

        <div className="pt-8 border-t border-neutral-200 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-dark text-white px-8 py-4 text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors duration-300 disabled:opacity-50 rounded-sm "
          >
            {isSubmitting ? "Processing..." : "Continue to Artwork Selection"}
          </button>
        </div>
      </form>

      <ArtworkSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        galleryId={user.gallery_id}
        validatedPayload={pendingPayload}
        onFinalSubmit={executeFinalSubmission}
      />
    </div>
  );
};
