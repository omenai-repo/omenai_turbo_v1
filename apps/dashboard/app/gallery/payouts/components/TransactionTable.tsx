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
  "Platform Commission",
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
    <div className="h-full w-full overflow-scroll">
      <table className=" w-full table-auto border-separate border-spacing-y-2 overflow-scroll text-left md:overflow-auto">
        <thead className="w-full rounded-full h-[40px] bg-[#EFEFEF] text-base font-semibold text-white">
          <tr className="px-1 rounded-full">
            {TABLE_HEAD.map((head) => (
              <th
                key={head}
                className="whitespace-nowrap  py-3 pl-3 text-[14px] font-medium text-gray-700"
              >
                <p className="font-bold text-[14px]">{head}</p>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {transaction_table_data.map((data: any, index: number) => {
            const isLast = index === transaction_table_data.length - 1;
            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

            return (
              <tr
                key={data.id}
                className="cursor-pointer bg-white ring-1 ring-[#EFEFEF] duration-200 my-2"
              >
                <td
                  className={`py-4 pl-3 text-[14px] font-medium text-gray-700`}
                >
                  <p className="font-medium text-[14px]">{data.id}</p>
                </td>
                <td
                  className={`py-4 pl-3 text-[14px] font-medium text-gray-700`}
                >
                  <p className="font-medium text-[14px]">{data.date}</p>
                </td>
                <td
                  className={`py-4 pl-3 text-[14px] font-medium text-gray-700`}
                >
                  <p className="font-medium text-[14px]">{data.gross}</p>
                </td>
                <td
                  className={`py-4 pl-3 text-[14px] font-medium text-gray-700`}
                >
                  <p className="font-medium text-[14px]">{data.net}</p>
                </td>
                <td
                  className={`py-4 pl-3 text-[14px] font-medium text-gray-700 flex items-center space-x-2`}
                >
                  <p className="font-medium text-[14px]">{data.commission}</p>
                </td>
                <td
                  className={`py-4 pl-3 text-[14px] font-medium text-gray-700`}
                >
                  <p className="font-medium text-[12px] px-4 py-1 rounded-full text-white bg-green-600 w-fit">
                    {data.status}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {transaction_table_data.length === 0 && (
        <div className="h-[35vh] w-full grid place-items-center">
          <NotFoundData />
        </div>
      )}
    </div>
  );
}
