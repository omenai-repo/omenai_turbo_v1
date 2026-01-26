import { ISupportTicket } from "@omenai/shared-types";

export const Icons = {
  Filter: () => (
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
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  ),
  Search: () => (
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
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Eye: () => (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  Refresh: () => (
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
      <path d="M23 4v6h-6"></path>
      <path d="M1 20v-6h6"></path>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  ),
};

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    OPEN: "bg-emerald-50 text-emerald-700 border-emerald-100",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-100",
    RESOLVED: "bg-slate-100 text-slate-600 border-slate-200",
    CLOSED: "bg-gray-50 text-gray-500 border-gray-100",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${styles[status] || styles.OPEN} tracking-wide uppercase`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    HIGH: "bg-rose-50 text-rose-700 border-rose-100",
    NORMAL: "bg-slate-50 text-slate-600 border-slate-200",
    LOW: "bg-gray-50 text-gray-500 border-gray-100",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${styles[priority] || styles.NORMAL} tracking-wide uppercase`}
    >
      {priority}
    </span>
  );
};
