import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { addArtistToRoster } from "@omenai/shared-services/gallery/roster/addArtistToRoster";
import {
  SelectedArtistState,
  ArtistAutocomplete,
} from "@omenai/shared-ui-components/components/artists/ArtistAutocomplete";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import React, { useState } from "react";
import Image from "next/image";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { CountryCombobox } from "./ArtistCountryCombobox";

interface AddArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  onSuccess: () => void;
}

// Extended state locally to include the logo for the success screen
type ModalArtistState = SelectedArtistState & { logo?: string | null };

export const AddArtistModal = ({
  isOpen,
  onClose,
  galleryId,
  onSuccess,
}: AddArtistModalProps) => {
  const [view, setView] = useState<"form" | "success">("form");
  const [localArtist, setLocalArtist] = useState<ModalArtistState>({
    artist_id: "",
    name: "",
    newGhostArtistName: "",
    birthyear: "",
    country_of_origin: "",
    logo: null,
  });

  const { csrf } = useAuth({ requiredRole: "gallery" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset all state and close
    setLocalArtist({
      artist_id: "",
      name: "",
      newGhostArtistName: "",
      birthyear: "",
      country_of_origin: "",
      logo: null,
    });
    setView("form");
    onClose();
  };

  const handleConfirmAdd = async () => {
    setIsSubmitting(true);

    const payload = localArtist.artist_id
      ? { gallery_id: galleryId, artist_id: localArtist.artist_id }
      : {
          gallery_id: galleryId,
          newGhostData: {
            name: localArtist.name,
            birthyear: localArtist.birthyear,
            country_of_origin: localArtist.country_of_origin,
          },
        };

    try {
      const res = await addArtistToRoster(payload, csrf || "");

      if (res.isOk) {
        setView("success");
      } else {
        toast_notif(res.message || "Failed to add artist", "error");
      }
    } catch (error: any) {
      toast_notif(
        "An unexpected error occurred - Failed to add artist",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessDone = () => {
    onSuccess();
    handleClose();
  };

  const displayArtistName = localArtist.name || localArtist.newGhostArtistName;
  const isNewGhost = !!localArtist.name && !localArtist.artist_id;
  const isMissingGhostData =
    isNewGhost && (!localArtist.birthyear || !localArtist.country_of_origin);
  const isButtonDisabled =
    (!localArtist.artist_id && !localArtist.name) ||
    isMissingGhostData ||
    isSubmitting;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-lg p-8 sm:p-12 relative rounded-sm   transition-all duration-300">
        {/* Close Button - Always visible */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* --- FORM VIEW --- */}
        {view === "form" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-normal text-neutral-900 mb-8">
              Add to Roster
            </h2>

            <div className="mb-10">
              <ArtistAutocomplete
                value={localArtist}
                onChange={setLocalArtist}
              />

              {localArtist.name && !localArtist.artist_id && (
                <div className="mt-6 flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500 overflow-visible">
                  <div className="w-1/2">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                      Birth Year
                    </label>
                    <input
                      type="text"
                      value={localArtist.birthyear || ""}
                      placeholder="e.g. 1985"
                      onChange={(e) =>
                        setLocalArtist((prev) => ({
                          ...prev,
                          birthyear: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4), // Optional: forces only 4 numbers
                        }))
                      }
                      className="w-full bg-transparent border-0 border-b border-neutral-300 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-0 transition-colors outline-none"
                    />
                  </div>
                  <div className="w-1/2 relative">
                    {" "}
                    {/* Added relative context for dropdown */}
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                      Country
                    </label>
                    {/* Replaced standard input with the Combobox */}
                    <CountryCombobox
                      value={localArtist.country_of_origin || ""}
                      onChange={(val) =>
                        setLocalArtist((prev) => ({
                          ...prev,
                          country_of_origin: val,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmAdd}
              disabled={isButtonDisabled} // Used our new, strict logic here
              className="w-full bg-neutral-900 text-white px-6 py-4 text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm  "
            >
              {isSubmitting ? "Adding..." : "Confirm & Add"}
            </button>
          </div>
        )}

        {/* --- SUCCESS VIEW --- */}
        {view === "success" && (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 py-4">
            {/* Minimalist Checkmark */}
            <div className="w-12 h-12 bg-neutral-900 rounded-sm -full flex items-center justify-center mb-8">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Artist Disambiguator UI */}
            <div className="h-20 w-20 shrink-0 rounded-sm -full bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center mb-5">
              {localArtist.logo ? (
                <Image
                  src={getGalleryLogoFileView(localArtist.logo, 200)}
                  alt={displayArtistName}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-xl font-medium tracking-wider text-neutral-500">
                  {displayArtistName.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <h3 className="text-2xl font-normal text-neutral-900 mb-2">
              {displayArtistName}
            </h3>

            <p className="text-sm text-neutral-500 mb-10 tracking-wide">
              has been successfully added to your roster of represented artists.
            </p>

            <button
              onClick={handleSuccessDone}
              className="w-full border border-neutral-900 text-neutral-900 px-6 py-4 text-xs font-medium tracking-widest uppercase hover:bg-neutral-50 transition-colors duration-300 rounded-sm  "
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
