"use client";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";

export default function SettingsAction() {
  const { updateDeleteUserAccountModalPopup, userUpdatePasswordModalPopup } =
    actionStore();
  return (
    <div className="grid grid-cols-2 items-center gap-x-4">
      <button
        type="button"
        onClick={() => userUpdatePasswordModalPopup(true)}
        className="w-full text-xs disabled:cursor-not-allowed whitespace-nowrap disabled:bg-[#E0E0E0] bg-dark rounded-sm text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
      >
        Change password
      </button>
      <button
        type="button"
        onClick={() => updateDeleteUserAccountModalPopup(true)}
        className="w-full text-xs disabled:cursor-not-allowed whitespace-nowrap disabled:bg-[#E0E0E0] bg-red-600 rounded-sm text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-red-600/80"
      >
        Delete my account
      </button>
    </div>
  );
}
