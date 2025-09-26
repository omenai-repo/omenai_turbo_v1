"use client";
import { FormEvent, useContext, useState } from "react";
import { InputCard } from "./InputCard";
import { TextareaCard } from "./TextareaCard";
import { updateProfile } from "@omenai/shared-services/update/updateProfile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { galleryProfileUpdate } from "@omenai/shared-state-store/src/gallery/gallery_profile_update/GalleryProfileUpdateStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { MapPin } from "lucide-react";

export const FormCard = () => {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const { updateData, clearData } = galleryProfileUpdate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const { isOk, body } = await updateProfile(
      "gallery",
      updateData,
      user?.id as string,
      csrf || ""
    );
    if (!isOk)
      toast.error("Error notification", {
        description: body.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else {
      // todo: Add session update fn
      toast.success("Operation successful", {
        description: `${body.message}... Please log back in`,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      setIsLoading(false);
      clearData();
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Design 1: Clean Card Layout */}
      <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-fluid-base font-semibold text-slate-900">
                Gallery Profile
              </h2>
              <p className="text-fluid-xs text-slate-600 mt-1">
                Update your gallery information
              </p>
            </div>
            <div className="flex items-center gap-2 text-fluid-xs text-slate-500">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-fluid-xs font-medium text-dark uppercase tracking-wide mb-4">
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-fluid-xs font-normal text-dark">
                    Gallery Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={user?.name}
                      readOnly
                      className="w-full px-4 py-3 text-fluid-xs bg-slate-50 border border-slate-200 rounded text-slate-900 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-fluid-xs font-normal text-dark">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email}
                      readOnly
                      className="w-full px-4 py-3 text-fluid-xs bg-slate-50 border border-slate-200 rounded text-slate-900 pr-24 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {user?.verified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-normal bg-green-100 text-green-700">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1 text-xs font-normal text-red-600 hover:text-red-700"
                        >
                          Verify Email
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Details */}
            <div>
              <h3 className="text-fluid-xs font-medium text-dark uppercase tracking-wide mb-4">
                Gallery Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <InputCard
                  label="Gallery Address"
                  defaultValue={user.address.address_line}
                  labelText="location"
                  className="w-full px-4 py-3 text-fluid-xs bg-white border border-slate-300 rounded text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
                />
                <InputCard
                  label="Admin Name"
                  defaultValue={user?.admin as string}
                  labelText="admin"
                  className="w-full px-4 py-3 text-fluid-xs bg-white border border-slate-300 rounded text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-fluid-xs font-normal text-dark uppercase tracking-wide mb-4">
                About Your Gallery
              </h3>
              <TextareaCard
                label="Gallery Description"
                rows={4}
                className="w-full px-4 py-3 text-fluid-xs bg-white border border-slate-300 rounded text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors resize-none"
                defaultValue={user?.description as string}
                name="description"
                placeholder="Tell visitors about your gallery, the artists you represent, and your mission..."
              />
            </div>
                    {/* Address */}
        <div className="group">
          <label className="block text-fluid-xs font-normal text-dark/50 mb-2">
            Gallery Address
          </label>
          <div className="flex items-center justify-between p-4 bg-gray-800 border border-line rounded">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-dark/50 mt-1" />
              <div>
                <p className="text-fluid-xs text-dark">
                  {user.address.address_line}
                </p>
                <p className="text-fluid-xs text-dark/50">
                  {user.address.city}, {user.address.state}, {}
                  {user.address.zip}
                </p>
              </div>
            </div>
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-dark  rounded hover:bg-dark/80 text-white 
                       transition-all duration-300 text-fluid-xxs font-normal"
            >
              Update Address
            </button>
          </div>
        </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-fluid-xs text-slate-500">
                  {!updateData.admin &&
                  !updateData.location &&
                  !updateData.description
                    ? "Make changes to enable save"
                    : "Ready to save your changes"}
                </p>
                <button
                  type="submit"
                  disabled={
                    (!updateData.admin &&
                      !updateData.location &&
                      !updateData.description) ||
                    isLoading
                  }
                  className="px-4 py-2 bg-slate-900 text-white text-fluid-xs font-normal rounded shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <LoadSmall />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
