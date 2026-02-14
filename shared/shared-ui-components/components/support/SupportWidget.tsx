"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSupportDefaulter } from "@omenai/shared-hooks/hooks/useSupportDefaulter";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createSupportTicket } from "@omenai/shared-services/support/createSupportTicket";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { SupportCategory } from "@omenai/shared-types";
import LZString from "lz-string";

// Components
import { SupportTrigger } from "./components/SupportTrigger";
import { SupportSuccess } from "./components/SupportSuccess";
import { SupportError } from "./components/SupportError";
import { SupportForm } from "./components/SupportForm";
import { OmenaiLogoCut } from "../logo/Logo";
import { Icons } from "./util";
import { ChevronLeft } from "lucide-react";
import { AiChatWindow } from "./components/AiChatWindow";

// Role-Based Access Control
const CATEGORY_PERMISSIONS: Record<string, SupportCategory[]> = {
  guest: ["GENERAL", "AUTH"],
  user: ["GENERAL", "ORDER", "PAYMENT", "CHECKOUT", "AUTH"],
  artist: ["GENERAL", "ORDER", "WALLET", "UPLOAD", "AUTH"],
  gallery: ["GENERAL", "ORDER", "SUBSCRIPTION", "PAYOUT", "UPLOAD", "AUTH"],
};

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  date: number;
  preview: string;
  messages: Message[];
}

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"CHAT" | "TICKET">("CHAT");

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Form State
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const pathname = usePathname();
  const { user, csrf } = useAuth();
  const { category: suggestedCategory, referenceId: suggestedRef } =
    useSupportDefaulter();

  // Form Data
  const [category, setCategory] = useState<SupportCategory>("GENERAL");
  const [referenceId, setReferenceId] = useState("");
  const [message, setMessage] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  const currentRole = user?.role
    ? (user.role as string).toLowerCase()
    : "guest";
  const allowedCategories = useMemo(() => {
    return CATEGORY_PERMISSIONS[currentRole] || CATEGORY_PERMISSIONS["guest"];
  }, [currentRole]);

  // --- PERSISTENCE & LIMITING LOGIC ---
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setActiveSessionId(null);
      return;
    }
    const storageKey = `omenai_chat_${user.id}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const decompressed = LZString.decompressFromUTF16(saved);
        const parsed = JSON.parse(decompressed || saved) as ChatSession[];

        // FIX: 24-HOUR EXPIRATION CHECK
        const oneDayMs = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const validSessions = parsed.filter((s) => now - s.date < oneDayMs);

        setSessions(validSessions);
      } catch (e) {
        console.error(e);
      }
    } else {
      setSessions([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const storageKey = `omenai_chat_${user.id}`;
    if (sessions.length > 0) {
      const stringified = JSON.stringify(sessions);
      const compressed = LZString.compressToUTF16(stringified);
      localStorage.setItem(storageKey, compressed);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [sessions, user]);

  // --- ACTIONS ---
  const createNewSession = (firstMessageContent?: string) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: firstMessageContent
        ? firstMessageContent.slice(0, 30) + "..."
        : "New Conversation",
      date: Date.now(),
      preview: firstMessageContent || "Start of conversation",
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev].slice(0, 5)); // Limit to 5 sessions
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const updateActiveSession = (newMessages: Message[]) => {
    if (!activeSessionId) return;

    // FIX: 50 MESSAGE CAP
    // Keep only the last 50 messages to prevent Context Window overflow and Lag
    const cappedMessages =
      newMessages.length > 50 ? newMessages.slice(-50) : newMessages;

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === activeSessionId) {
          const lastMsg = cappedMessages[cappedMessages.length - 1];
          return {
            ...session,
            messages: cappedMessages,
            preview: lastMsg
              ? lastMsg.content.slice(0, 40) + "..."
              : session.preview,
            title:
              session.messages.length === 0 && cappedMessages.length > 0
                ? cappedMessages[0].content.slice(0, 30) + "..."
                : session.title,
          };
        }
        return session;
      }),
    );
  };

  // --- GUEST AUTO-START LOGIC ---
  useEffect(() => {
    if (isOpen && !user && !activeSessionId) {
      createNewSession();
    }
  }, [isOpen, user, activeSessionId]);

  // --- HANDLERS ---
  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setMode("CHAT");
  };

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
      setMode("CHAT");

      // FIX: ALWAYS RESET TO HOME VIEW ON CLOSE
      // This ensures next open shows the "Start Conversation" screen, not old chat
      setActiveSessionId(null);
    }, 400);
  };

  const handleCategoryChange = (newCategory: SupportCategory) => {
    setCategory(newCategory);
    if (newCategory === suggestedCategory) setReferenceId(suggestedRef);
    else setReferenceId("");
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
  if (!isOpen) return <SupportTrigger onClick={toggleWidget} />;

  if (mode === "CHAT") {
    return (
      <div className="fixed inset-0 z-[9999] w-full flex items-end sm:items-end justify-end p-4 pointer-events-none">
        <div
          className="fixed inset-0 bg-black/5 backdrop-blur-sm pointer-events-auto transition-all duration-400"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <AiChatWindow
            isOpen={isOpen}
            onClose={handleClose}
            pageContext={pathname || "general"}
            switchToSupport={() => setMode("TICKET")}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => setActiveSessionId(id)}
            onCreateSession={createNewSession}
            onUpdateSession={updateActiveSession}
            onBackToHome={() => setActiveSessionId(null)}
          />
        </div>
      </div>
    );
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
            <div className="px-7 py-5 border-b border-slate-300 bg-white sticky top-0 z-10 space-y-4">
              <button
                onClick={() => setMode("CHAT")}
                className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft size={12} /> Back to AI Advisor
              </button>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full flex items-center justify-center shadow-sm">
                    <OmenaiLogoCut />
                  </div>
                  <div>
                    <h3 className="font-light text-lg text-dark tracking-tight">
                      Contact Support
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-light">
                      Typically responds within ~ 6 hours
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
            <div className="p-6 overflow-y-auto bg-white">
              <SupportForm
                user={user}
                category={category}
                setCategory={setCategory}
                onCategoryChange={handleCategoryChange}
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
