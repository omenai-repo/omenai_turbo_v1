"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { sidebarItems } from "../navigations/NavigationMockData"; // Adjust path if needed

export function GlobalCommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Keyboard Shortcuts & Custom Event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleCustomEvent = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-menu", handleCustomEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-menu", handleCustomEvent);
    };
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter items based on search query
  const filteredItems = sidebarItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Input Area */}
        <div className="flex items-center border-b border-neutral-100 px-4">
          <Search size={18} className="text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="w-full bg-transparent border-0 py-4 px-3 text-base text-neutral-900 placeholder-neutral-400 focus:ring-0 outline-none"
          />
          <kbd className="text-[10px] font-sans border border-neutral-200 rounded-sm  px-1.5 py-0.5 bg-neutral-50 text-neutral-500 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500 text-center">
              No results found.
            </p>
          ) : (
            <ul className="flex flex-col">
              {filteredItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleSelect(item.href)}
                    className="w-full text-left px-3 py-3 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors rounded-sm -lg flex justify-between items-center group"
                  >
                    <span>{item.label}</span>
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-widest text-neutral-400 transition-opacity">
                      Jump to
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
