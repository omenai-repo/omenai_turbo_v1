"use client";

import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";

export default function SettingsActions() {
  const { updateDeleteArtistAccountModalPopup, updatePasswordModalPopup } =
    artistActionStore();
  return (
    <div className="h-[calc(70vh-3rem)] grid place-items-center">
      <div className="flex items-center justify-center gap-x-4">
        <button
          type="button"
          onClick={() => updatePasswordModalPopup(true)}
          className="h-[35px] p-5 rounded-full w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
        >
          Change password
        </button>
        <button
          type="button"
          onClick={() => updateDeleteArtistAccountModalPopup(true)}
          className="h-[35px] p-5 rounded-full w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-red-600 hover:bg-red-500 text-white text-[14px] font-normal"
        >
          Delete my account
        </button>
      </div>
    </div>
  );
}
