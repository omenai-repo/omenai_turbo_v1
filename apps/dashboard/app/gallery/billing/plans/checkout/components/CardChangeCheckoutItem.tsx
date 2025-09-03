import { CreditCard, Info } from "lucide-react";
import React from "react";

export default function CardChangeCheckoutItem() {
  return (
    <div className="max-w-full">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Header Section */}
        <div className="bg-dark p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-fluid-xs font-medium">Card Change</h1>
              <p className="text-fluid-xxs text-gray-300">
                Update your payment method
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-fluid-xs font-medium text-amber-900 mb-1">
                Verification Required
              </p>
              <p className="text-fluid-xxs text-amber-800 leading-relaxed">
                A temporary $0.5 charge will be applied to verify your payment
                method. This amount will be credited to your next subscription
                payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
