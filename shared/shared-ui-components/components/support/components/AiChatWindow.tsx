"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  X,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronLeft,
  MessageSquarePlus,
  Square,
} from "lucide-react";
import { getApiUrl } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

// --- TYPES ---
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  date: number;
  preview: string;
  messages: Message[];
}

interface AiChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext: string;
  switchToSupport: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: (initialMsg?: string) => string;
  onUpdateSession: (messages: Message[]) => void;
  onBackToHome: () => void;
}

const SUGGESTIONS_MAP: Record<string, string[]> = {
  payment: [
    "Is my payment secure?",
    "How is shipping calculated?",
    "Return policy?",
    "Duties included?",
  ],
  upload: [
    "Max image size?",
    "How does pricing work?",
    "Exclusivity rules?",
    "When do I get paid?",
  ],
  orders: [
    "Track my shipment",
    "Order not arrived",
    "Cancel order",
    "Contact artist",
  ],
  gallery: [
    "Subscription tiers?",
    "Commission rates?",
    "Price on Demand?",
    "Logistics handling?",
  ],
  default: [
    "About about the Omenai platform",
    "Help me find great artworks",
    "Tell me about Omenai's purchase process",
    "Certificate of Authenticity?",
  ],
};

export function AiChatWindow({
  isOpen,
  onClose,
  pageContext,
  switchToSupport,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onUpdateSession,
  onBackToHome,
}: AiChatWindowProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // STATE
  const [streamingContent, setStreamingContent] = useState("");
  const [fullContent, setFullContent] = useState("");

  // REFS
  const isTypingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // VIEW LOGIC
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];
  const isGuest = !user;
  const isChatView = isGuest || !!activeSessionId;

  const getSuggestions = () => {
    const currentPath = pageContext.toLowerCase();
    if (currentPath.includes("purchase") || currentPath.includes("payment"))
      return SUGGESTIONS_MAP.payment;
    if (currentPath.includes("upload") || currentPath.includes("artworks"))
      return SUGGESTIONS_MAP.upload;
    if (currentPath.includes("orders") || currentPath.includes("transactions"))
      return SUGGESTIONS_MAP.orders;
    if (currentPath.includes("gallery") || currentPath.includes("subscription"))
      return SUGGESTIONS_MAP.gallery;
    return SUGGESTIONS_MAP.default;
  };
  const currentSuggestions = getSuggestions();

  // --- EFFECTS ---
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current)
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 10);
    }
  }, [isOpen, messages.length, streamingContent, activeSessionId, isChatView]);

  useEffect(() => {
    if (streamingContent.length < fullContent.length) {
      isTypingRef.current = true;
      const timeout = setTimeout(() => {
        setStreamingContent(fullContent.slice(0, streamingContent.length + 1));
      }, 5);
      return () => clearTimeout(timeout);
    } else {
      isTypingRef.current = false;
    }
  }, [streamingContent, fullContent]);

  // --- STOP HANDLER (NEW) ---
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      isTypingRef.current = false;

      setStreamingContent(fullContent);
    }
  };

  // --- SEND HANDLER ---
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = onCreateSession(textToSend);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };
    const currentMessages =
      sessions.find((s) => s.id === currentSessionId)?.messages || [];
    const updatedMessages = [...currentMessages, userMessage];

    onUpdateSession(updatedMessages);
    setInput("");
    setFullContent("");
    setStreamingContent("");
    setIsLoading(true);

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTimeout(() => {
      if (scrollRef.current)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 10);

    try {
      const response = await fetch(`${getApiUrl()}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages, pageContext }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Network error");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      const aiMessageId = (Date.now() + 1).toString();
      onUpdateSession([
        ...updatedMessages,
        { id: aiMessageId, role: "assistant", content: "" },
      ]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        accumulatedText += chunkValue;
        setFullContent(accumulatedText);
      }
      onUpdateSession([
        ...updatedMessages,
        { id: aiMessageId, role: "assistant", content: accumulatedText },
      ]);
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Stream stopped by user");
        // Save what we have so far
        const aiMessageId = (Date.now() + 1).toString();
        onUpdateSession([
          ...updatedMessages,
          { id: aiMessageId, role: "assistant", content: fullContent },
        ]);
      } else {
        console.error("Stream Error:", error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayMessages = messages.map((m) => {
    if (
      m.role === "assistant" &&
      m.id === messages[messages.length - 1].id &&
      isTypingRef.current
    ) {
      return { ...m, content: streamingContent };
    }
    return m;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 w-full md:w-[440px] h-[100dvh] md:h-[700px] max-h-none md:max-h-[85vh] bg-[#FDFDFD] md:rounded-2xl shadow-2xl border-0 md:border border-slate-200 overflow-hidden flex flex-col z-[9999] font-sans"
        >
          {/* BACKGROUND */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50/50">
            <motion.div
              animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 1.3, 1] }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
                delay: 2,
              }}
              className="absolute top-1/2 -right-20 w-80 h-80 bg-rose-200/15 rounded-full blur-3xl"
            />
          </div>

          {/* HEADER */}
          <div className="absolute top-0 left-0 right-0 h-18 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-20 flex items-center justify-between px-6 py-4 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4 relative z-10">
              {!isGuest && isChatView && (
                <button
                  onClick={onBackToHome}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100/50 text-slate-400 hover:text-slate-900 transition-colors"
                  aria-label="Back to History"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <div
                className={`relative group cursor-default transition-all ${!isGuest && isChatView ? "ml-6" : ""}`}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <div className="relative w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/50">
                  <Sparkles
                    size={18}
                    className="text-indigo-200"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white" />
                </span>
              </div>

              <div className="flex flex-col justify-center">
                <h3 className="text-[17px] text-slate-900 leading-none font-bold tracking-tight">
                  Omenai{" "}
                  <span className="font-sans font-light text-slate-400">
                    Advisor
                  </span>
                </h3>
                <p className="text-[10px] font-semibold text-dark/80 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                  Live Assistant
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="relative z-10 group p-2 rounded-xl transition-all duration-300 text-slate-300 backdrop-blur-sm border border-neutral-300 hover:border-neutral-200"
            >
              <X
                size={20}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>

          {/* CONTENT AREA */}
          <div
            className="flex-1 overflow-y-auto pt-24 pb-4 px-5 z-10 overscroll-contain"
            ref={scrollRef}
            onWheel={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: "contain" }}
          >
            {/* --- VIEW 1: HOME SCREEN (User Only) --- */}
            {!isChatView && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              >
                <h4 className="font-serif text-2xl text-slate-800 mb-2 tracking-tight">
                  Good{" "}
                  {new Date().getHours() < 12
                    ? "morning"
                    : new Date().getHours() < 18
                      ? "afternoon"
                      : "evening"}{" "}
                  {`${user ? user.name.split(" ")[0] : ""}`},
                </h4>
                <p className="text-slate-400 font-light text-sm leading-relaxed max-w-[280px] mb-8">
                  Access your chat history or start a new inquiry.
                </p>

                <button
                  onClick={() => onCreateSession()}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-300/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-[15px] font-medium mb-8"
                >
                  <MessageSquarePlus size={18} />
                  Start New Conversation
                </button>

                {sessions.length > 0 ? (
                  <div className="grid gap-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 pl-1 flex items-center gap-2">
                      <Clock size={12} /> Conversation History
                    </p>
                    {sessions.map((sess) => (
                      <button
                        key={sess.id}
                        onClick={() => onSelectSession(sess.id)}
                        className="text-left bg-white border border-slate-200 p-3.5 rounded-xl hover:border-indigo-300 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-slate-700 text-[13px] truncate w-[70%]">
                            {sess.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(sess.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {sess.preview}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-50">
                    <p className="text-xs text-slate-400 uppercase tracking-widest">
                      No previous history
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* --- VIEW 2: ACTIVE CHAT --- */}
            {isChatView && (
              <div className="space-y-6">
                {messages.length === 0 && (
                  <div className="grid gap-2 mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 pl-1">
                      Suggested
                    </p>
                    {currentSuggestions.map((text, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(text)}
                        className="text-left bg-white/60 hover:bg-white backdrop-blur-sm border border-slate-200/60 hover:border-indigo-200 p-3.5 rounded-xl text-slate-700 text-[13px] transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-between group"
                      >
                        {text}
                        <ArrowRight
                          size={14}
                          className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {displayMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-slideIn`}
                  >
                    {m.role === "user" && (
                      <div className="max-w-[85%] bg-slate-900 text-white px-5 py-2 rounded-2xl rounded-tr-sm text-[12px] leading-relaxed shadow-lg shadow-slate-300/20">
                        {m.content}
                      </div>
                    )}
                    {m.role === "assistant" && (
                      <div className="max-w-[95%] group">
                        <div className="flex gap-4">
                          <div className="w-[2px] bg-gradient-to-b from-indigo-400/50 to-transparent min-h-[24px] shrink-0" />
                          <div className="prose prose-slate prose-p:text-[12px] prose-p:leading-7 prose-p:text-slate-700 prose-headings:font-serif prose-headings:font-normal prose-strong:font-medium prose-strong:text-slate-900 prose-li:text-slate-600 text-[13.5px]">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && !fullContent && (
                  <div className="flex gap-4 max-w-[90%] pl-0.5">
                    <div className="w-[2px] bg-slate-200 h-6 shrink-0" />
                    <p className="text-xs text-slate-500 flex items-center gap-x-2 font-medium animate-pulse tracking-widest uppercase mt-1">
                      Thinking...{" "}
                      <Sparkles size={16} className="animate-spin" />
                    </p>
                  </div>
                )}
                <div className="h-2" />
              </div>
            )}
            <div className="mt-3 w-full absolute bottom-4 flex justify-center pb-safe">
              <button
                onClick={switchToSupport}
                className="text-[11px] text-slate-400 hover:text-dark transition-colors tracking-wide font-medium"
              >
                Need human assistance?{" "}
                <span className="underline decoration-slate-300 underline-offset-2">
                  Create a Ticket
                </span>
              </button>
            </div>
          </div>

          {/* --- INPUT AREA --- */}
          {isChatView && (
            <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 shrink-0 z-20">
              <div className="relative group shadow-sm rounded-xl">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Omenai Advisor..."
                  rows={1}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white transition-all border border-slate-200 focus:border-indigo-200 rounded-xl px-4 py-3.5 pr-12 text-[15px] focus:outline-none focus:ring-4 focus:ring-indigo-50/50 resize-none max-h-[120px] placeholder:text-slate-400 font-normal"
                  style={{ scrollbarWidth: "none" }}
                />

                {/* BUTTON: Switches between SEND (Arrow) and STOP (Square) */}
                <button
                  onClick={isLoading ? handleStop : () => handleSend()}
                  disabled={!isLoading && !input.trim()}
                  className="absolute right-2 bottom-4 p-2 bg-slate-900 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark transition-all shadow-sm active:scale-95"
                >
                  {isLoading ? (
                    // STOP ICON
                    <Square
                      size={16}
                      fill="currentColor"
                      className="text-white"
                    />
                  ) : (
                    // SEND ICON
                    <ArrowRight size={18} strokeWidth={2} />
                  )}
                </button>
              </div>

              <div className="mt-3 flex justify-center pb-safe">
                <button
                  onClick={switchToSupport}
                  className="text-[11px] text-slate-400 hover:text-dark transition-colors tracking-wide font-medium"
                >
                  Need human assistance?{" "}
                  <span className="underline decoration-slate-300 underline-offset-2">
                    Create a Ticket
                  </span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
