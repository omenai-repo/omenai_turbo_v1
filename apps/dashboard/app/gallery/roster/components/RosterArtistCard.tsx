import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { RosterArtist } from "@omenai/shared-types";
import Image from "next/image";

interface RosterArtistCardProps {
  artist: RosterArtist;
  isRemoving: boolean;
  onRemove: (id: string) => void;
}

export const RosterArtistCard = ({
  artist,
  isRemoving,
  onRemove,
}: RosterArtistCardProps) => {
  return (
    <div className="group relative flex flex-col p-6 bg-white border border-neutral-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 rounded-sm  ">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar / Initials */}
          <div className="h-12 w-12 shrink-0 rounded-sm -full bg-neutral-100 overflow-hidden flex items-center justify-center">
            {artist.logo ? (
              <Image
                src={getGalleryLogoFileView(artist.logo, 200)}
                alt={artist.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xs font-medium tracking-wider text-neutral-500">
                {artist.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-medium text-neutral-900">
                {artist.name}
              </h3>
              {artist.artist_verified && (
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-neutral-400 tracking-wide mt-0.5">
              {artist.profile_status === "claimed"
                ? "Registered Profile"
                : "Gallery Managed"}
            </span>
            {/* Tombstone data if available */}
            {(artist.country_of_origin || artist.birthyear) && (
              <span className="text-[11px] text-neutral-400 mt-1">
                {artist.country_of_origin}{" "}
                {artist.birthyear ? `, b. ${artist.birthyear}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(artist.artist_id)}
          disabled={isRemoving}
          className="opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700 transition-all duration-200 disabled:opacity-50"
          aria-label={`Remove ${artist.name} from roster`}
        >
          {isRemoving ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
};
