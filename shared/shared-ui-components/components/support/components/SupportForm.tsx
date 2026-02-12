import { useState } from "react";
import { SupportCategory } from "@omenai/shared-types";
import { Icons } from "../util";
import {
  INPUT_CLASS,
  SELECT_CLASS, // Or construct similar styles
  TEXTAREA_CLASS,
} from "../../styles/inputClasses";
import PremiumDatePicker from "./DatePicker";

// Config
const CATEGORY_LABELS: Record<SupportCategory, string> = {
  GENERAL: "General Inquiry",
  PAYMENT: "Payment Issue",
  CHECKOUT: "Checkout / Purchase Issue",
  ORDER: "Order Issue",
  SUBSCRIPTION: "Billing & Subscription",
  PAYOUT: "Payouts (Stripe)",
  WALLET: "Wallet & Withdrawals",
  UPLOAD: "Artwork Upload Issue",
  AUTH: "Login or Registeration Issue",
};

interface SupportFormProps {
  user: any;
  category: SupportCategory;
  setCategory: (c: SupportCategory) => void;
  referenceId: string;
  setReferenceId: (s: string) => void;
  message: string;
  setMessage: (s: string) => void;
  guestEmail: string;
  setGuestEmail: (s: string) => void;
  transactionDate: string;
  setTransactionDate: (s: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  pathname: string;
  allowedCategories: SupportCategory[];
  onCategoryChange: (c: SupportCategory) => void;
}

export function SupportForm({
  user,
  category,
  setCategory,
  referenceId,
  setReferenceId,
  message,
  setMessage,
  guestEmail,
  setGuestEmail,
  transactionDate,
  setTransactionDate,
  isSubmitting,
  onSubmit,
  pathname,
  allowedCategories,
  onCategoryChange,
}: SupportFormProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Logic: Show reference field for Money/Orders/Checkout, but HIDE for Upload issues
  const showReferenceField = [
    "ORDER",
    "PAYMENT",
    "WALLET",
    "CHECKOUT",
  ].includes(category);

  const showDateField = category === "PAYMENT";

  // Logic: Dynamic Labels and Placeholders
  const getReferenceConfig = () => {
    switch (category) {
      case "CHECKOUT":
        return {
          label: "Artwork ID/ Artwork Name",
          placeholder: "Leave empty if not applicable",
        };
      case "ORDER":
        return {
          label: "Order Number",
          placeholder: "Leave empty if not applicable",
        };
      case "PAYMENT":
        return {
          label: "Transaction ID",
          placeholder: "Leave empty if not applicable",
        };

      case "WALLET":
        return {
          label: "Transaction ID (Optional)",
          placeholder: "Leave empty if not applicable",
        };
      default:
        return { label: "Reference ID", placeholder: "ID..." };
    }
  };

  const { label: fieldLabel, placeholder: fieldPlaceholder } =
    getReferenceConfig();

  return (
    <div className="space-y-6">
      {!user && (
        <div className="space-y-2">
          <label className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.12em]">
            Email Address
          </label>
          <input
            type="email"
            required
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="your@email.com"
            className={INPUT_CLASS}
          />
        </div>
      )}

      {/* Custom Dropdown */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.12em]">
          Category
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="appearance-none w-full bg-slate-50/50 border border-slate-200/60 text-dark text-sm rounded-xl focus:border-slate-400 focus:bg-white focus:ring-0 block px-4 py-3 outline-none transition-all font-light text-left flex items-center justify-between"
          >
            <span>{CATEGORY_LABELS[category]}</span>
            <Icons.ChevronDown />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute z-20 w-full my-2 bg-white border border-slate-200/60 rounded-xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] overflow-hidden backdrop-blur-xl max-h-60 overflow-y-auto">
                {allowedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onCategoryChange(cat); // <--- USE NEW HANDLER
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-fluid-xxs font-light transition-all ${
                      category === cat
                        ? "bg-dark text-white"
                        : "text-dark hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      {CATEGORY_LABELS[cat]}
                      {category === cat && (
                        <span className="text-white">
                          <Icons.Check />
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {(showReferenceField || showDateField) && (
        <div className="p-5 bg-slate-50 rounded-lg space-y-4 border border-slate-300">
          {showReferenceField && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.12em]">
                  {fieldLabel}
                </label>
              </div>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder={fieldPlaceholder}
                className={INPUT_CLASS}
              />
            </div>
          )}

          {showDateField && (
            <PremiumDatePicker
              value={transactionDate}
              onChange={(date) => setTransactionDate(date)}
              label="Transaction Date"
            />
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.12em]">
          Message
        </label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={TEXTAREA_CLASS}
          rows={5}
          placeholder="Please describe your inquiry in detail..."
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full group relative flex justify-center py-3.5 px-4 border-0 text-sm font-light rounded-lg text-white bg-dark hover:bg-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] border border-slate-300"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing
          </span>
        ) : (
          "Submit Request"
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-[10px] text-slate-400 font-light">
          Secured by Omenai • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
