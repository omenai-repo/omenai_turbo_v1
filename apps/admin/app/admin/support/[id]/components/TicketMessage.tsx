export function TicketMessage({ ticket }: { ticket: any }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-900">Issue Description</h3>
        <span className="text-xs text-slate-500">
          {new Date(ticket.createdAt).toLocaleString()}
        </span>
      </div>
      <div className="p-6">
        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
          {ticket.message}
        </p>
      </div>

      {/* Quick Reply Action (MVP) */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
        <a
          href={`mailto:${ticket.userEmail}?subject=Re: Support Ticket ${ticket.ticketId} - ${ticket.category}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
        >
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          Reply via Email
        </a>
        <p className="text-xs text-slate-400 mt-2">
          This will open your default email client with the subject line
          pre-filled.
        </p>
      </div>
    </div>
  );
}
