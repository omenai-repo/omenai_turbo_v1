import { CreditCard, Info } from "lucide-react";
import React from "react";

export default function CardChangeCheckoutItem() {
  return (
    <div className="max-w-full">
      <div className="bg-white border border-gray-100 rounded overflow-hidden shadow-sm">
        {/* Header Section */}
        <div className="bg-dark p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-fluid-xxs font-medium">Card Change</h1>
              <p className="text-fluid-xxs text-gray-300">
                Update your payment method
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
