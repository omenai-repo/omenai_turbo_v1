"use client";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";

export default function SettingsAction() {
  const { updateDeleteUserAccountModalPopup, userUpdatePasswordModalPopup } =
    actionStore();

  return (
    <section className="w-full">
      {/* ===== HEADER ===== */}
      <div className="mb-10">
        <h1 className="text-fluid-lg font-semibold text-slate-900">
          Security & Account
        </h1>
        <p className="mt-1 text-fluid-xxs text-slate-500">
          Manage your login credentials and account safety
        </p>
      </div>

      {/* ===== SECURITY ACTIONS ===== */}
      <div className="w-full rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="px-6 py-5 sm:px-8 border-b border-slate-200">
          <h2 className="text-fluid-xxs font-semibold text-slate-900">
            Account Security
          </h2>
          <p className="mt-1 text-fluid-xxs text-slate-500">
            Keep your account protected
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {/* ---- PASSWORD ---- */}
          <div className="px-6 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-fluid-xxs font-medium text-slate-900">
                Password
              </h3>
              <p className="mt-1 text-fluid-xxs text-slate-500">
                Use a strong password to protect your account
              </p>
            </div>

            <button
              onClick={() => userUpdatePasswordModalPopup(true)}
              className="
                inline-flex items-center justify-center
                rounded-full bg-slate-900 px-5 py-2.5
                text-fluid-xxs font-medium text-white
                transition hover:bg-slate-800
                focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
              "
            >
              Change password
            </button>
          </div>
        </div>
      </div>

      {/* ===== DANGER ZONE ===== */}
      <div className="mt-12">
        <h2 className="mb-4 text-fluid-xxs font-medium uppercase tracking-wide text-red-600">
          Danger zone
        </h2>

        <div className="w-full rounded-3xl border border-red-200 bg-red-50/60">
          <div className="px-6 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-fluid-xxs font-semibold text-red-900">
                Delete account
              </h3>
              <p className="mt-1 text-fluid-xxs text-red-700">
                This action is permanent and cannot be undone.
              </p>
            </div>

            <button
              onClick={() => updateDeleteUserAccountModalPopup(true)}
              className="
                inline-flex items-center justify-center
                rounded-full border border-red-300 bg-white
                px-5 py-2.5 text-fluid-xxs font-medium text-red-600
                transition hover:bg-red-50
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              "
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
