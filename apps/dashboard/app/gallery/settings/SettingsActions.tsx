"use client";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";

export default function SettingsActions() {
  const { updateDeleteGalleryAccountModalPopup, updatePasswordModalPopup } =
    actionStore();
  return (
    <div className="w-full max-w-4xl">
      {/* Design 1: Security Settings Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-2xl">
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-fluid-base font-semibold text-slate-900">
                Account Security
              </h2>
              <p className="text-fluid-xxs text-slate-600">
                Manage your password and account settings
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Password Section */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  <h3 className="font-semibold text-fluid-xxs text-slate-900">
                    Password
                  </h3>
                </div>
                <p className="text-fluid-xxs text-slate-600">
                  Valid as at today
                </p>
                <p className="text-fluid-xxs text-slate-500 mt-1">
                  Use a strong password to protect your account
                </p>
              </div>
              <button
                onClick={() => updatePasswordModalPopup(true)}
                className="px-4 py-2 bg-slate-900 text-white text-fluid-xxs font-medium rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-fluid-xxs font-medium text-red-600 uppercase tracking-wide mb-4">
              Danger Zone
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
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
                    <h3 className="font-semibold text-fluid-xxs text-red-900">
                      Delete Account
                    </h3>
                  </div>
                  <p className="text-fluid-xxs text-red-700">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>
                <button
                  onClick={() => updateDeleteGalleryAccountModalPopup(true)}
                  className="px-4 py-2 bg-white border border-red-300 text-red-600 text-fluid-xxs font-medium rounded-full hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
