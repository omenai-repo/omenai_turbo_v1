"use client";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";

export default function SettingsActions() {
  const { updateDeleteGalleryAccountModalPopup, updatePasswordModalPopup } =
    actionStore();
  return (
    <div className="h-[80vh] grid grid-cols-2 items-center gap-x-4">
      <button
        type="button"
        onClick={() => updatePasswordModalPopup(true)}
        className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
      >
        Change password
      </button>
      <button
        type="button"
        onClick={() => updateDeleteGalleryAccountModalPopup(true)}
        className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-red-600 hover:bg-red-500 text-white text-fluid-xs font-normal"
      >
        Delete my account
      </button>
    </div>
  );
}
