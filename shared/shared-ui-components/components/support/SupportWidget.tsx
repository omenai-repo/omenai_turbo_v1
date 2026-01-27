"use client";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSupportDefaulter } from "@omenai/shared-hooks/hooks/useSupportDefaulter";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createSupportTicket } from "@omenai/shared-services/support/createSupportTicket";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { SupportCategory } from "@omenai/shared-types";

import { SupportTrigger } from "./components/SupportTrigger";
import { SupportSuccess } from "./components/SupportSuccess";
import { SupportError } from "./components/SupportError";
import { SupportForm } from "./components/SupportForm";
import { OmenaiLogoCut } from "../logo/Logo";
import { Icons } from "./util";

// 1. Role-Based Access Control
const CATEGORY_PERMISSIONS: Record<string, SupportCategory[]> = {
  // Guests see limited options to avoid confusion
  guest: ["GENERAL", "AUTH"],
  // Collectors see buying options
  user: ["GENERAL", "ORDER", "PAYMENT", "CHECKOUT", "AUTH"],
  // Artists see selling & wallet options
  artist: ["GENERAL", "ORDER", "WALLET", "UPLOAD", "AUTH"],
  // Galleries see billing & payout options
  gallery: ["GENERAL", "ORDER", "SUBSCRIPTION", "PAYOUT", "UPLOAD", "AUTH"],
};

export default function SupportWidget() {
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- HOOKS ---
  const pathname = usePathname();
  const { user, csrf } = useAuth();
  const { category: suggestedCategory, referenceId: suggestedRef } =
    useSupportDefaulter();

  // --- FORM STATE ---
  const [category, setCategory] = useState<SupportCategory>("GENERAL");
  const [referenceId, setReferenceId] = useState("");
  const [message, setMessage] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  // --- ROLE LOGIC ---
  const currentRole = user?.role
    ? (user.role as string).toLowerCase()
    : "guest";

  // Calculate allowed categories for this user
  const allowedCategories = useMemo(() => {
    return CATEGORY_PERMISSIONS[currentRole] || CATEGORY_PERMISSIONS["guest"];
  }, [currentRole]);

  // --- SYNC LOGIC ---
  useEffect(() => {
    if (isOpen && !ticketId && !hasError) {
      // Only suggest a category if the user is ALLOWED to see it
      if (allowedCategories.includes(suggestedCategory)) {
        setCategory(suggestedCategory);
      } else {
        setCategory("GENERAL");
      }
      setReferenceId(suggestedRef);
      setTransactionDate("");
    }
  }, [
    isOpen,
    suggestedCategory,
    suggestedRef,
    ticketId,
    hasError,
    allowedCategories,
  ]);

  const handleCategoryChange = (newCategory: SupportCategory) => {
    setCategory(newCategory);

    if (newCategory === suggestedCategory) {
      setReferenceId(suggestedRef);
    } else {
      setReferenceId("");
    }

    setTransactionDate("");
  };

  // --- HANDLERS ---
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setTicketId(null);
      setHasError(false);
      setErrorMessage("");
      setMessage("");
      setGuestEmail("");
      setReferenceId("");
      setTransactionDate("");
    }, 400);
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage("");
  };

  const getReferenceTypeLabel = (cat: SupportCategory) => {
    switch (cat) {
      case "ORDER":
        return "ORDER_NUMBER";
      case "CHECKOUT":
        return "ARTWORK_ID";
      case "PAYMENT":
        return "TRANSACTION_REF";
      case "PAYOUT":
        return "STRIPE_PAYOUT_ID";
      case "WALLET":
        return "WITHDRAWAL_REF";
      default:
        return "REFERENCE_ID";
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setHasError(false);

    const metaPayload: Record<string, any> = {
      referenceType: getReferenceTypeLabel(category),
    };

    if (transactionDate) {
      metaPayload.transactionDate = transactionDate;
    }

    const payload = {
      category,
      referenceId,
      message,
      pageUrl: window.location.href,
      timestamp: new Date().toISOString(),
      entity: (user?.role as any) || "user",
      userId: user?.id || "",
      userEmail: user?.email || guestEmail,
      transactionDate: transactionDate || null,
      meta: metaPayload,
    };

    try {
      const response = await createSupportTicket(payload, csrf || "");

      if (!response.isOk) {
        setHasError(true);
        setErrorMessage(response.message || "Failed to create ticket.");
        toast_notif(response.message || "Failed to create ticket.", "error");
      } else {
        setTicketId(response.ticketId || "OM-REC");
        toast_notif("Ticket Created Successfully", "success");
      }
    } catch (error) {
      setHasError(true);
      setErrorMessage("Network error. Please try again.");
      toast_notif("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER ---
  if (!isOpen) {
    return <SupportTrigger onClick={() => setIsOpen(true)} />;
  }

  return (
    <div className="fixed inset-0 z-[9999] w-full flex items-end sm:items-end justify-end p-4 pointer-events-none">
      <div
        className="fixed inset-0 bg-black/5 backdrop-blur-sm pointer-events-auto transition-all duration-400"
        onClick={handleClose}
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      <div
        className="pointer-events-auto relative w-full max-w-md bg-white rounded-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-300 overflow-hidden flex flex-col max-h-[88vh]"
        style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {ticketId ? (
          <SupportSuccess ticketId={ticketId} onClose={handleClose} />
        ) : hasError ? (
          <SupportError
            message={errorMessage}
            onRetry={handleRetry}
            onClose={handleClose}
          />
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-7 py-6 border-b border-slate-300 bg-white flex justify-between items-start sticky top-0 z-10">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full flex items-center justify-center shadow-sm">
                  <OmenaiLogoCut />
                </div>
                <div>
                  <h3 className="font-normal text-xl text-dark tracking-tight">
                    Need assistance?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    {user
                      ? `Hello ${user.name || "there"}, how may we assist?`
                      : "How may we assist you today?"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-dark hover:bg-slate-100 p-2 rounded-full transition-all duration-200"
              >
                <Icons.Close />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto bg-white">
              <SupportForm
                user={user}
                category={category}
                setCategory={setCategory}
                referenceId={referenceId}
                setReferenceId={setReferenceId}
                onCategoryChange={handleCategoryChange}
                message={message}
                setMessage={setMessage}
                guestEmail={guestEmail}
                setGuestEmail={setGuestEmail}
                transactionDate={transactionDate}
                setTransactionDate={setTransactionDate}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                pathname={pathname}
                allowedCategories={allowedCategories}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
