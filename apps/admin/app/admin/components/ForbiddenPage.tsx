import React from "react";
import { ShieldX, Home, ArrowLeft, Lock } from "lucide-react";

interface ForbiddenPageProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
  userRole?: string;
}

export default function ForbiddenPage({
  onGoBack,
  onGoHome,
  userRole,
}: ForbiddenPageProps) {
  return (
    <div className="min-h-[90svh] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-red-100 rounded mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gray-200 rounded mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-orange-100 rounded mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-md w-full">
        {/* Main card */}
        <div className="bg-white rounded shadow-2xl border border-gray-200/50 p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded flex items-center justify-center mb-6">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>

          {/* Error code */}
          <div className="text-6xl font-bold text-gray-900 mb-2">403</div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Forbidden
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            You don't have permission to access this resource. Please contact
            your administrator if you believe this is an error.
          </p>

          {/* Additional info card */}
          <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-8">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-amber-800 font-medium mb-1">
                  Need access?
                </p>
                <p className="text-sm text-amber-700">
                  Contact your team administrator to request the appropriate
                  permissions for this section.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            )}
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            )}
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-slate-700 mt-6">
          Error Code: ACCESS_DENIED_INSUFFICIENT_PRIVILEGES
        </p>
      </div>

      {/* CSS for blob animation */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
