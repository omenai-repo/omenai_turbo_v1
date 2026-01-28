"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sparkles, User, Bot, ArrowUp } from "lucide-react";
import { getApiUrl } from "@omenai/url-config/src/config";
import BubbleHeader from "./BubbleHeader";
import { INPUT_CLASS } from "../../styles/inputClasses";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext: string;
  switchToSupport: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function AiChatWindow({
  isOpen,
  onClose,
  pageContext,
  switchToSupport,
  messages,
  setMessages,
}: AiChatWindowProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // TYPING EFFECT STATE
  const [streamingContent, setStreamingContent] = useState("");
  const [fullContent, setFullContent] = useState("");
  const isTypingRef = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // New Ref for Textarea

  // FIX: BODY SCROLL LOCK
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // FIX: AUTO-GROW TEXTAREA
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to calculate correct scrollHeight for shrinkage
      textareaRef.current.style.height = "auto";
      // Set to scrollHeight to expand
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; // Max height 120px
    }
  }, [input]);

  // AUTO-SCROLL (Smart scroll for incoming AI messages)
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      // Use setTimeout to ensure the DOM is fully rendered before scrolling
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 10);
    }
  }, [isOpen]);

  // TYPING ENGINE
  useEffect(() => {
    if (streamingContent.length < fullContent.length) {
      isTypingRef.current = true;
      const timeout = setTimeout(() => {
        setStreamingContent(fullContent.slice(0, streamingContent.length + 1));
      }, 1);
      return () => clearTimeout(timeout);
    } else {
      isTypingRef.current = false;
    }
  }, [streamingContent, fullContent]);

  // SUBMIT HANDLER
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setFullContent("");
    setStreamingContent("");

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // FIX: FORCE SCROLL TO BOTTOM ON USER SEND
    // We use setTimeout to allow the DOM to render the new message first
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 10);

    // Reset textarea height manually
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch(`${getApiUrl()}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://omenai.app",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          pageContext,
        }),
      });

      if (!response.ok) throw new Error("Network error");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      const aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, role: "assistant", content: "" },
      ]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        accumulatedText += chunkValue;
        setFullContent(accumulatedText);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId ? { ...m, content: accumulatedText } : m,
        ),
      );
    } catch (error) {
      console.error("Stream Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLE ENTER KEY (Submit vs New Line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default newline
      handleSubmit();
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
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="fixed bottom-0 right-6 w-[90vw] max-w-[500px] h-[650px] max-h-[80vh] bg-white rounded shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-50 font-sans"
        >
          {/* HEADER */}
          <BubbleHeader onClose={onClose} />

          {/* CHAT AREA */}
          <div
            className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50 overscroll-contain"
            ref={scrollRef}
            onWheel={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: "contain" }}
          >
            {displayMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60 p-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                  <Sparkles className="text-indigo-400" size={32} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700">
                    How may I assist?
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Ask about artwork details, shipping fees, or get collection
                    advice.
                  </p>
                </div>
              </div>
            )}

            {displayMessages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${m.role === "user" ? "bg-white border border-slate-200" : "bg-indigo-600 text-white"}`}
                >
                  {m.role === "user" ? (
                    <User size={16} className="text-slate-600" />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>

                <div
                  className={`flex flex-col max-w-[75%] ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl text-[13px] shadow-sm leading-snug ${
                      m.role === "user"
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none prose-p:leading-normal prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-a:text-indigo-600">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && !fullContent && (
              <div className="flex gap-4">
                <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white px-4 py-4 rounded rounded-tl-none border border-slate-100 shadow-sm flex gap-1.5 items-center">
                  <span
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form
              onSubmit={handleSubmit}
              className="flex gap-2 relative items-end"
            >
              {/* FIX: Multi-line Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Omenai Advisor"
                rows={1}
                className={`${INPUT_CLASS} resize-none min-h-[42px] py-3 max-h-[120px] overflow-y-auto`}
                style={{ scrollbarWidth: "none" }} // Hide scrollbar for cleaner look (optional)
              />
              <button
                type="submit"
                disabled={(isLoading && !fullContent) || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 mb-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center shrink-0"
              >
                {isLoading && !fullContent ? (
                  <span className="animate-spin text-xs">↻</span>
                ) : (
                  <ArrowUp size={18} strokeWidth={2.5} />
                )}
              </button>
            </form>

            {/* FOOTER */}
            <div className="mt-3 text-center">
              <button
                onClick={switchToSupport}
                className="text-[10px] text-slate-400 hover:text-indigo-600 font-medium transition-colors underline"
              >
                Need detailed help? Create a Support Ticket
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
