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
        className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
      >
        Change password
      </button>
      <button
        type="button"
        onClick={() => updateDeleteUserAccountModalPopup(true)}
        className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-red-600 hover:bg-red-800 text-white text-fluid-xs font-normal"
      >
        Delete my account
      </button>
    </div>
  );
}
