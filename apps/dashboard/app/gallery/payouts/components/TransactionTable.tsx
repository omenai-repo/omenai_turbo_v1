"use client";
import { PurchaseTransactionModelSchemaTypes } from "@omenai/shared-types";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";

import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { convertPriceStringToNumber } from "@omenai/shared-utils/src/priceStringToNumberConverter";
import { FiArrowDownLeft } from "react-icons/fi";
import { FiArrowUpRight } from "react-icons/fi";

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
  const transaction_table_data = table.map(
    (
      transaction: PurchaseTransactionModelSchemaTypes & {
        createdAt: string;
        updatedAt: string;
      }
    ) => {
      const table = {
        id: transaction.trans_id,
        date: formatIntlDateTime(transaction.trans_date),
        gross: formatPrice(transaction.trans_pricing.unit_price),
        net: formatPrice(
          transaction.trans_pricing.unit_price -
            transaction.trans_pricing.commission
        ),
        commission: formatPrice(transaction.trans_pricing.commission),
        status: "Completed",
      };

      return table;
    }
  );
  return (
    <div className="h-full w-full overflow-auto">
      <div className="bg-white border border-gray-100 rounded overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {transaction_table_data.map((data, index) => (
              <tr
                key={data.id}
                className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {data.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{data.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {data.gross}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {data.net}
                </td>
                {/* <td className="px-6 py-4 text-sm text-gray-600">
                  {data.commission}
                </td> */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {data.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transaction_table_data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transactions found
            </h3>
            <p className="text-sm text-slate-700">
              Your transaction history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
