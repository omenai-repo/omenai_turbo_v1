"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSupportDefaulter } from "@omenai/shared-hooks/hooks/useSupportDefaulter";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createSupportTicket } from "@omenai/shared-services/support/createSupportTicket";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { SupportCategory } from "@omenai/shared-types";

// Components
import { SupportTrigger } from "./components/SupportTrigger";
import { SupportSuccess } from "./components/SupportSuccess";
import { SupportError } from "./components/SupportError";
import { SupportForm } from "./components/SupportForm";
import { OmenaiLogoCut } from "../logo/Logo";
import { Icons } from "./util";
import { MessageSquareText, ChevronLeft } from "lucide-react"; // Icons for navigation
import { AiChatWindow } from "./components/AiChatWindow";

// 1. Role-Based Access Control
const CATEGORY_PERMISSIONS: Record<string, SupportCategory[]> = {
  guest: ["GENERAL", "AUTH"],
  user: ["GENERAL", "ORDER", "PAYMENT", "CHECKOUT", "AUTH"],
  artist: ["GENERAL", "ORDER", "WALLET", "UPLOAD", "AUTH"],
  gallery: ["GENERAL", "ORDER", "SUBSCRIPTION", "PAYOUT", "UPLOAD", "AUTH"],
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  // NEW: Controls the view (AI Chat vs Human Ticket)
  const [mode, setMode] = useState<"CHAT" | "TICKET">("CHAT");

  // Form State
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  // --- HOOKS ---
  const pathname = usePathname();
  const { user, csrf } = useAuth();
  const { category: suggestedCategory, referenceId: suggestedRef } =
    useSupportDefaulter();

  // --- FORM DATA ---
  const [category, setCategory] = useState<SupportCategory>("GENERAL");
  const [referenceId, setReferenceId] = useState("");
  const [message, setMessage] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  // --- ROLE LOGIC ---
  const currentRole = user?.role
    ? (user.role as string).toLowerCase()
    : "guest";
  const allowedCategories = useMemo(() => {
    return CATEGORY_PERMISSIONS[currentRole] || CATEGORY_PERMISSIONS["guest"];
  }, [currentRole]);

  // --- SYNC LOGIC ---
  useEffect(() => {
    // Only sync form defaults if we are actually opening the TICKET mode
    if (isOpen && mode === "TICKET" && !ticketId && !hasError) {
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
    mode,
    suggestedCategory,
    suggestedRef,
    ticketId,
    hasError,
    allowedCategories,
  ]);

  // --- HANDLERS ---
  const toggleWidget = () => {
    setIsOpen(!isOpen);
    // Always reset to Chat when opening, but keep state if closing
    if (!isOpen) setMode("CHAT");
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form state after animation delay
    setTimeout(() => {
      setTicketId(null);
      setHasError(false);
      setErrorMessage("");
      setMessage("");
      setGuestEmail("");
      setReferenceId("");
      setTransactionDate("");
      setMode("CHAT");
    }, 400);
  };

  const handleCategoryChange = (newCategory: SupportCategory) => {
    setCategory(newCategory);
    if (newCategory === suggestedCategory) {
      setReferenceId(suggestedRef);
    } else {
      setReferenceId("");
    }
    setTransactionDate("");
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
    if (transactionDate) metaPayload.transactionDate = transactionDate;

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

  // 1. The Trigger Button (Always Visible)
  if (!isOpen) {
    return <SupportTrigger onClick={toggleWidget} />;
  }

  // 2. MODE A: AI CHAT (Floating Bubble)
  if (mode === "CHAT") {
    return (
      <>
        {/* Helper overlay to close on click outside */}
        <div className="fixed inset-0 z-40" onClick={handleClose} />

        <AiChatWindow
          isOpen={isOpen}
          onClose={handleClose}
          pageContext={suggestedCategory || "general"}
          switchToSupport={() => setMode("TICKET")}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      </>
    );
  }

  // 3. MODE B: TICKET FORM (Modal Sheet)
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
            <div className="px-7 py-5 border-b border-slate-300 bg-white sticky top-0 z-10 space-y-4">
              {/* Navigation Back to AI */}
              <button
                onClick={() => setMode("CHAT")}
                className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft size={12} />
                Back to AI Advisor
              </button>

              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full flex items-center justify-center shadow-sm">
                    <OmenaiLogoCut />
                  </div>
                  <div>
                    <h3 className="font-normal text-xl text-dark tracking-tight">
                      Contact Support
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-normal">
                      Wait time: ~24 hours
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
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto bg-white">
              <SupportForm
                user={user}
                category={category}
                setCategory={setCategory} // Pass setter for compatibility
                onCategoryChange={handleCategoryChange} // Pass handler for logic
                referenceId={referenceId}
                setReferenceId={setReferenceId}
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
