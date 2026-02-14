import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useSupportDefaulter } from "@omenai/shared-hooks/hooks/useSupportDefaulter";
import { createSupportTicket } from "@omenai/shared-services/support/createSupportTicket";
import { fetchUserSupportTickets } from "@omenai/shared-services/support/fetchUserSupportTickets";
import { SupportCategory } from "@omenai/shared-types";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export const Icons = {
  Close: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Help: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  Check: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Success: () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        className="animate-[scale_0.6s_ease-out]"
        style={{ transformOrigin: "center" }}
      ></circle>
      <polyline
        points="8 12 11 15 16 9"
        strokeWidth="1.5"
        className="animate-[draw_0.6s_ease-out_0.3s_both]"
        style={{ strokeDasharray: 20, strokeDashoffset: 20 }}
      ></polyline>
    </svg>
  ),
  Error: () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        className="animate-[scale_0.6s_ease-out]"
      ></circle>
      <line
        x1="15"
        y1="9"
        x2="9"
        y2="15"
        strokeWidth="1.5"
        className="animate-[draw_0.4s_ease-out_0.3s_both]"
      ></line>
      <line
        x1="9"
        y1="9"
        x2="15"
        y2="15"
        strokeWidth="1.5"
        className="animate-[draw_0.4s_ease-out_0.3s_both]"
      ></line>
    </svg>
  ),
  Copy: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),

  ChevronDown: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  Search: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Filter: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
};
// --- Badges ---
export const UserStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    OPEN: "bg-emerald-50 text-emerald-700 border-emerald-100",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-100",
    RESOLVED: "bg-slate-100 text-slate-600 border-slate-200",
    CLOSED: "bg-gray-50 text-gray-500 border-gray-100",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles[status] || styles.OPEN} tracking-wide uppercase`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    HIGH: "text-rose-600 bg-rose-50 border-rose-100",
    NORMAL: "text-slate-600 bg-slate-50 border-slate-200",
    LOW: "text-gray-500 bg-gray-50 border-gray-100",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${styles[priority] || styles.NORMAL} tracking-wide uppercase`}
    >
      {priority}
    </span>
  );
};
