import React from "react";
import { Check } from "lucide-react";
export default function CredentialsUpdateModal() {
  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded max-w-sm w-full p-6 shadow-2xl animate-slideUp">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-fluid-md font-semibold text-dark mb-2">
            Credentials Updated
          </h3>
          <p className="text-fluid-xs text-dark/50">
            Your professional credentials have been successfully updated.
          </p>
        </div>
      </div>
    </div>
  );
}
