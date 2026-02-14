"use client";
import { PurchaseTransactionModelSchemaTypes } from "@omenai/shared-types";

import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

const TABLE_HEAD = [
  "Trans ID",
  "Date",
  "Gross earning",
  "Net earning",
  "Status",
];

export function TransactionTable({
  table,
}: {
  table: (PurchaseTransactionModelSchemaTypes & {
    createdAt: string;
    updatedAt: string;
  })[];
}) {
  const transaction_table_data = table.map((transaction) => ({
    id: transaction.trans_id,
    date: formatIntlDateTime(transaction.trans_date),
    gross: formatPrice(transaction.trans_pricing.unit_price),
    net: formatPrice(
      transaction.trans_pricing.unit_price -
        transaction.trans_pricing.commission
    ),
    status: "Completed",
  }));

  return (
    <div className="w-full rounded bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-900">
          Transaction history
        </h2>
        <span className="text-xs text-slate-500">
          {transaction_table_data.length} records
        </span>
      </div>

      {/* Scroll container */}
      <div className="relative max-h-[500px] overflow-y-auto pr-2">
        {transaction_table_data.length > 0 ? (
          <table className="w-full border-separate border-spacing-y-2">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                {["ID", "Date", "Gross", "Net", "Status"].map((head) => (
                  <th key={head} className="px-4 pb-2">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {transaction_table_data.map((data) => (
                <tr
                  key={data.id}
                  className="rounded bg-slate-50 hover:bg-slate-100 transition"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    #{data.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {data.date}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {data.gross}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {data.net}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      {data.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded bg-slate-100">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900">
              No transactions yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Completed payouts will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
