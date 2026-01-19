// components/profile/UserProfile.tsx
"use client";

import React, { useState, useEffect } from "react";
import ProfileAvatar from "./ProfileAvatar";
import FloatingActionBar from "./FloatingActionBar";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import PreferencesGrid from "./PreferenceGrid";
import { useRouter } from "next/navigation";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { updateProfile } from "@omenai/shared-services/update/updateProfile";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import {} from "@omenai/rollbar-config";
import { useRollbar } from "@rollbar/react";
export default function UserProfile({
  user,
}: {
  user: Pick<
    IndividualSchemaTypes,
    "address" | "email" | "name" | "preferences" | "verified" | "phone"
  >;
}) {
  const rollbar = useRollbar();

  const queryClient = useQueryClient();

  const router = useRouter();
  const { user: userBase, csrf } = useAuth({ requiredRole: "user" });
  const { updateAddressModalPopup } = actionStore();
  const [formData, setFormData] = useState({
    name: user.name,
    preferences: user.preferences,
    phone: user.phone,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for changes
  useEffect(() => {
    const isNameChanged = formData?.name !== user.name;
    const isPhoneChanged = formData.phone !== user.phone;

    const isPrefsChanged =
      JSON.stringify(formData.preferences.sort()) !==
        JSON.stringify(user.preferences.sort()) &&
      formData.preferences.length === 5;

    setIsDirty(isNameChanged || isPrefsChanged || isPhoneChanged);
  }, [formData]);

  const handleSave = async () => {
    // In a real app, API call here
    setLoading(true);
    // You would usually update user here or refetch
    try {
      const profile_update = await updateProfile(
        "individual",
        formData,
        userBase.user_id,
        csrf || ""
      );
      if (!profile_update.isOk) {
        toast_notif(
          profile_update.body.message ||
            "Something went wrong, please try again or contact support",
          "error"
        );
        return;
      }
      toast_notif(
        `${profile_update.body.message || "Profile information updated successfully"}`,
        "success"
      );
      await queryClient.invalidateQueries({
        queryKey: ["fetch_user_info"],
      });
      router.refresh();
      setIsDirty(false);
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "Something went wrong, please try again or contact support",
        "error"
      );
    } finally {
      setLoading(false);
      updateAddressModalPopup(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: user.name,
      preferences: user.preferences,
      phone: user.phone,
    });
  };

  return (
    <div className="min-h-screen w-full text-dark ">
      <div className="max-w-7xl mx-auto py-4">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ProfileAvatar name={formData.name} verified={user.verified} />

          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div className="space-y-1">
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="block w-full md:w-auto text-3xl md:text-4xl font-semibold bg-transparent border-b border-transparent hover:border-slate-200 focus:ring-0 focus:border-dark focus:border-b border-x-0 border-t-0 focus:outline-none transition-colors  placeholder-slate-300 px-0"
                placeholder="Your Name"
              />
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-slate-400 text-sm font-medium">
                  {user.email}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100`}
                >
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          {/* Left Column: Personal Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-50 rounded">
                  <svg
                    className="w-5 h-5 text-slate-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883-.393 1.627-1.006 2.122C9.408 8.784 9.01 9.68 9.01 10.74c0 1.25.753 2.27 1.865 2.608a6.505 6.505 0 01-1.728 2.651"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-dark">
                  Personal Details
                </h3>
              </div>

              <div className="space-y-6 flex-1">
                {/* Phone */}
                <div className="group">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full text-base text-slate-700 bg-slate-50/50 border rounded p-4 focus:bg-white focus:border-slate-300 focus:ring-0 border-slate-200 disabled:cursor-not-allowed text-fluid-xs transition-all hover:bg-slate-50"
                  />
                </div>

                {/* Address */}
                <div className="group">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                    Shipping Address
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={user.address.address_line}
                      disabled
                      className="w-full text-base text-slate-700 bg-slate-50/50 border rounded p-4 focus:bg-white focus:border-slate-300 focus:ring-0 border-slate-200 disabled:cursor-not-allowed text-fluid-xs transition-all hover:bg-slate-50"
                      placeholder="Street"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={user.address.city}
                        disabled
                        className="w-full text-base text-slate-700 bg-slate-50/50 border rounded p-4 focus:bg-white focus:border-slate-300 focus:ring-0 border-slate-200 disabled:cursor-not-allowed text-fluid-xs transition-all hover:bg-slate-50"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={user.address.zip}
                        disabled
                        className="w-full text-base text-slate-700 bg-slate-50/50 border rounded p-4 focus:bg-white focus:border-slate-300 focus:ring-0 border-slate-200 disabled:cursor-not-allowed text-fluid-xs transition-all hover:bg-slate-50"
                        placeholder="Zip"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={user.address.state}
                        disabled
                        className="w-full text-base text-slate-700 bg-slate-50/50 border rounded p-4 focus:bg-white focus:border-slate-300 border-slate-200 focus:ring-0 transition-all hover:bg-slate-50"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={user.address.country}
                        disabled
                        className="w-full text-base text-slate-700 bg-slate-50/50 border rounded p-4 focus:bg-white focus:border-slate-300 focus:ring-0 border-slate-200 disabled:cursor-not-allowed text-fluid-xs transition-all hover:bg-slate-50"
                        placeholder="Zip"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full grid place-items-center">
                  <button
                    onClick={() => updateAddressModalPopup(true)}
                    className="rounded bg-dark p-4 text-xs font-normal w-full text-white hover:bg-slate-800"
                  >
                    Edit Address information
                  </button>
                </div>
              </div>

              <div className="pt-8 mt-auto border-t border-slate-50">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="capitalize">Role: Collector</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preferences */}
          <div className="lg:col-span-7">
            <PreferencesGrid
              selected={formData.preferences}
              onChange={(newPrefs) =>
                setFormData({ ...formData, preferences: newPrefs })
              }
            />

            {/* Additional "Premium" Visual Element */}
            <div className="mt-6 bg-gradient-to-r from-dark to-slate-800 rounded-[32px] p-8 text-white shadow-lg overflow-hidden relative">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-medium mb-1">Account Security</h4>
                  <p className="text-slate-300 text-sm font-light">
                    Your account is safe and secure.
                  </p>
                </div>
                <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      <FloatingActionBar
        isVisible={isDirty}
        onSave={handleSave}
        onReset={handleReset}
        loading={loading}
      />
    </div>
  );
}
