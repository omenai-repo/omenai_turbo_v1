"use client";
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
export default function CredentialsVerificationModal() {
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded max-w-md w-full p-6 shadow-2xl animate-slideUp">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-fluid-md font-semibold text-dark mb-2">
            Verify Credentials Update
          </h3>
          <p className="text-fluid-xs text-dark/50 mb-6">
            Please confirm that you want to update your professional
            credentials. This action will be logged for verification purposes.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="flex-1 px-4 py-2.5 bg-gray-300 text-dark rounded hover:bg-gray-400 
                       transition-all duration-300 text-fluid-xs font-light"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowVerificationModal(false);
                setShowCredentialsModal(true);
                setTimeout(() => setShowCredentialsModal(false), 2000);
              }}
              className="flex-1 px-4 py-2.5 bg-dark text-white rounded hover:bg-dark/90 
                       transition-all duration-300 text-fluid-xs font-light"
            >
              Confirm Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
