"use client";

import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { AlertCircle, Lock, Trash2 } from "lucide-react";

export default function AccountSettings() {
  const { updatePasswordModalPopup, updateDeleteArtistAccountModalPopup } =
    artistActionStore();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="pb-6 border-b border-line">
        <h2 className="text-fluid-base font-semiboldtext-dark mb-2">
          Account Settings
        </h2>
        <p className="text-fluid-xxs text-dark/50">
          Manage your security and account preferences
        </p>
      </div>

      {/* Security Section */}
      <div className="bg-gradient-to-br from-gray-800 to-white p-6 rounded-2xl border border-line">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-dark/10 rounded flex items-center justify-center">
              <Lock className="w-6 h-6 text-dark" />
            </div>
            <div>
              <h3 className="text-fluid-xxs font-medium text-dark">
                Password & Security
              </h3>
              <p className="text-fluid-xxs text-dark/50 mt-1">
                Update your password to keep your account secure
              </p>
            </div>
          </div>
          <button
            onClick={() => updatePasswordModalPopup(true)}
            className="px-4 py-2 bg-dark text-white rounded-full hover:bg-dark/90 
                           transition-all duration-300 text-fluid-xxs font-normal"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl">
        <h3 className="text-fluid-xxs font-medium text-red-900 mb-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>Danger Zone</span>
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-fluid-xxs font-medium text-dark">
              Delete Account
            </h4>
            <p className="text-fluid-xxs text-dark/50 mt-1">
              Permanently remove your account and all associated data
            </p>
          </div>
          <button
            onClick={() => updateDeleteArtistAccountModalPopup(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 
                           transition-all duration-300 text-fluid-xxs font-normal flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
