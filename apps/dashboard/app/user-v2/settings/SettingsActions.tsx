"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import UpdatePasswordForm from "./UpdatePasswordForm";

export default function SettingsAction() {
  const { updateDeleteUserAccountModalPopup, userUpdatePasswordModalPopup } =
    actionStore();
  return (
    <div className="w-full flex flex-col gap-8 lg:p-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-fluid-base font-semibold text-slate-900">
          Account Security
        </h2>
        <p className="text-fluid-xxs text-slate-600">
          Manage your security and settings
        </p>
      </div>
      {/* Design 1: Security Settings Card */}
      <div className="bg-white w-full  mx-auto rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className=" p-4 lg:p-8">
          {/* Password Section */}
          <UpdatePasswordForm />
        </div>
      </div>
      {/* Danger Zone */}
      <div className="bg-white w-full  mx-auto rounded-3xl shadow-sm border border-red-200 overflow-hidden">
        <div className="p-8">
          <div className="">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <h3 className="font-semibold text-fluid-xxs uppercase text-red-600">
                    Delete Account
                  </h3>
                </div>
                <p className="text-fluid-xxs text-red-700">
                  Deleting your account will permanently remove all your data.
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => updateDeleteUserAccountModalPopup(true)}
                className="px-4 py-2 w-full lg:w-auto bg-white border border-red-300 text-red-600 text-fluid-xxs font-medium rounded-full hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
