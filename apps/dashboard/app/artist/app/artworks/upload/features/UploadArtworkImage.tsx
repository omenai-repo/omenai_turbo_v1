"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import {
  Alert,
  Radio,
  Text,
  Group,
  Button,
  Stack,
  ThemeIcon,
  List,
  Collapse,
} from "@mantine/core";

// Icons
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
      clipRule="evenodd"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-3.5 h-3.5"
  >
    <path
      fillRule="evenodd"
      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
      clipRule="evenodd"
    />
  </svg>
);

export default function UploadArtworkImage() {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const { image, setImage, updateArtworkUploadData, artworkUploadData } =
    artistArtworkUploadStore();
  const router = useRouter();

  // Default is rolled. User must explicitly opt-in to see stretched options.
  const [packagingType, setPackagingType] = useState<"rolled" | "stretched">(
    "rolled",
  );
  const [showStretchedWarning, setShowStretchedWarning] = useState(false);

  const acceptedFileTypes = ["jpg", "jpeg", "png", "webp"];
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file.",
      });
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File too large", {
        description: `Max size is ${MAX_SIZE_MB}MB.`,
      });
      return;
    }

    const type = file.type.split("/")[1];
    if (!acceptedFileTypes.includes(type)) {
      toast.error("Unsupported format", {
        description: "Use JPEG, JPG, PNG, or WEBP.",
      });
      return;
    }
    setImage(file);
    e.target.value = "";
  };

  function handleImageSubmit() {
    if (!image) {
      toast_notif("Please upload your artwork before proceeding", "error");
      return;
    }

    updateArtworkUploadData("packaging_type", packagingType);

    toast.info("Processing", { description: "Preparing pricing module..." });
    router.push("/artist/app/artworks/upload/pricing");
  }

  return (
    <div className="h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-full bg-white rounded shadow-xl overflow-hidden flex flex-col md:flex-row h-full max-h-[800px] border border-slate-100">
        {/* --- LEFT: IMAGE UPLOAD (Visual Focus) --- */}
        <div className="w-full md:w-1/2 bg-slate-50 p-8 flex flex-col justify-center items-center border-r border-slate-100 relative">
          <div className="w-full grid place-items-center mb-5">
            {image ? (
              <button
                type="button"
                onClick={() => setImage(null)}
                className="relative group"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt="uploaded artwork"
                  className="w-auto h-auto max-h-[300px] max-w-full object-contain rounded shadow-lg transition-all duration-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity cursor-pointer text-white font-medium">
                  Click to Remove
                </div>
              </button>
            ) : (
              <button
                type="button"
                className="w-full max-w-[500px] aspect-square border-2 border-dashed border-slate-400 bg-slate-50 rounded-xl flex flex-col items-center justify-center p-8 hover:border-dark hover:bg-slate-100 transition-all group"
                onClick={() => imagePickerRef.current?.click()}
              >
                <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-slate-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  Click to upload artwork image
                </span>
                <span className="text-xs text-slate-500 mt-2 text-center max-w-xs">
                  Supports JPG, JPEG, PNG (Max 5MB). High resolution
                  recommended.
                </span>
              </button>
            )}
            <input
              type="file"
              hidden
              ref={imagePickerRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.webp"
            />
          </div>
        </div>

        {/* --- RIGHT: CONFIGURATION --- */}
        <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex-1">
            <h3 className="text-md font-medium text-slate-900 mb-6">
              Shipping Configuration
            </h3>

            {/* Default State: Rolled */}
            <div
              id="rolled-option"
              tabIndex={-1}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer mb-6 ${
                packagingType === "rolled"
                  ? "border-dark bg-slate-50 ring-1 ring-dark"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => {
                setPackagingType("rolled");
                setShowStretchedWarning(false);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Radio
                    checked={packagingType === "rolled"}
                    readOnly
                    color="dark"
                    className="mt-1"
                  />
                  <div>
                    <Text size="sm" fw={600} className="text-slate-900">
                      Rolled (Standard)
                    </Text>
                    <Text
                      size="xs"
                      className="text-slate-500 mt-1 leading-relaxed"
                    >
                      Canvas is unstretched and shipped in a tube. <br />
                      <span className="text-emerald-600 font-medium">
                        Recommended for lower shipping fees.
                      </span>
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Inconspicuous Switch */}
            {!showStretchedWarning && packagingType === "rolled" && (
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setPackagingType("stretched");
                    setShowStretchedWarning(true);
                  }}
                  className="text-xs text-slate-400 underline hover:text-slate-600 transition-colors"
                >
                  Need to ship stretched? (Not recommended)
                </button>
              </div>
            )}

            {/* Warning Mode: Stretched Selected */}
            <Collapse in={showStretchedWarning}>
              <div className="mt-2 border border-red-100 rounded-xl overflow-hidden">
                <Alert
                  variant="light"
                  color="red"
                  title={
                    <span className="font-bold flex items-center gap-2">
                      <WarningIcon /> Special Handling Required
                    </span>
                  }
                  className="bg-red-50/50"
                >
                  <Text size="xs" className="leading-relaxed text-red-800">
                    Shipping stretched artwork attracts{" "}
                    <strong>significantly higher fees</strong> (volume weight).
                    Only select this if the artwork absolutely cannot be rolled
                    (e.g., heavy texture, rigid board).
                  </Text>
                </Alert>

                <div className="p-5 bg-white">
                  <div
                    className={`flex items-center gap-3 mb-4 cursor-pointer`}
                    onClick={() => setPackagingType("stretched")}
                  >
                    <Radio
                      checked={packagingType === "stretched"}
                      readOnly
                      color="red"
                    />
                    <Text size="sm" fw={600} className="text-slate-900">
                      Ship as Stretched
                    </Text>
                  </div>

                  <Text
                    size="xs"
                    fw={600}
                    className="text-slate-700 mb-2 uppercase tracking-wider"
                  >
                    Mandatory Packing Requirements:
                  </Text>
                  <List
                    spacing="xs"
                    size="xs"
                    center
                    icon={
                      <ThemeIcon
                        color="slate"
                        size={16}
                        radius="xl"
                        variant="light"
                      >
                        <CheckIcon />
                      </ThemeIcon>
                    }
                  >
                    <List.Item>
                      Use heavy-duty double-walled cardboard box
                    </List.Item>
                    <List.Item>
                      Minimum 2 inches of bubble wrap on all sides
                    </List.Item>
                    <List.Item>
                      Reinforced corner protectors (plastic or foam)
                    </List.Item>
                    <List.Item>
                      Face of artwork protected by acid-free paper
                    </List.Item>
                  </List>
                </div>
              </div>

              {/* Back to Safety */}
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setPackagingType("rolled");
                    setShowStretchedWarning(false);
                  }}
                  className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
                >
                  ← Switch back to Rolled (Save on fees)
                </button>
              </div>
            </Collapse>
          </div>

          {/* Footer Action */}
          <div className="pt-6 border-t border-slate-100 mt-auto">
            <Button
              fullWidth
              size="md"
              color="#091830"
              disabled={!image}
              onClick={handleImageSubmit}
              className="bg-dark disabled:hover:bg-dark/10 hover:bg-dark/80 transition-transform active:scale-[0.99] font-normal"
            >
              Continue to Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
