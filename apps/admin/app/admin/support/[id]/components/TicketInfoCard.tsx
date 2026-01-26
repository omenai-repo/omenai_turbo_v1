export function TicketInfoCard({ ticket }: { ticket: any }) {
  const meta = ticket.meta || {};

  return (
    <div className="space-y-6">
      {/* 1. User Details */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          User Details
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-medium text-slate-900 break-all">
              {ticket.userEmail}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">User Role</p>
            <p className="text-sm font-medium text-slate-900 capitalize">
              {ticket.userType.toLowerCase()}
            </p>
          </div>
          {ticket.userId && (
            <div>
              <p className="text-xs text-slate-500">User ID</p>
              <p className="text-xs font-mono text-slate-600 bg-slate-50 p-1 rounded mt-1 break-all select-all">
                {ticket.userId}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Technical Context */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Context
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500">Category</p>
            <p className="text-sm font-medium text-slate-900">
              {ticket.category.replace("_", " ")}
            </p>
          </div>

          {ticket.referenceId && (
            <div>
              <p className="text-xs text-slate-500">
                {meta.referenceType
                  ? meta.referenceType.replace("_", " ")
                  : "Reference ID"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 break-all select-all">
                  {ticket.referenceId}
                </p>
              </div>
            </div>
          )}

          {meta.browser && (
            <div>
              <p className="text-xs text-slate-500">User Agent</p>
              <p
                className="text-xs text-slate-400 mt-1 line-clamp-2"
                title={meta.browser}
              >
                {meta.browser}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500">Source URL</p>
            <a
              href={ticket.pageUrl}
              target="_blank"
              className="text-xs text-blue-600 hover:underline mt-1 block truncate"
            >
              {ticket.pageUrl}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
