"use client";
import { PurchaseTransactionModelSchemaTypes } from "@omenai/shared-types";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";

import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { convertPriceStringToNumber } from "@omenai/shared-utils/src/priceStringToNumberConverter";
import { FiArrowDownLeft } from "react-icons/fi";
import { FiArrowUpRight } from "react-icons/fi";

const TABLE_HEAD = [
  "Transaction ID",
  "Date",
  "Gross amount",
  "Net amount",
  "Transaction type",
  "Status",
];

export function TransactionTable({
  table,
}: {
  table: PurchaseTransactionModelSchemaTypes &
    { createdAt: any; updatedAt: any }[];
}) {
  const transaction_table_data = table.map((transaction: any) => {
    const priceNumber =
      convertPriceStringToNumber(transaction.trans_amount) * 0.7;
    const table = {
      id: transaction.trans_id,
      date: formatIntlDateTime(transaction.trans_date),
      gross: transaction.trans_amount,
      net: formatPrice(priceNumber),
      type: "Incoming",
      status: "Completed",
    };

    return table;
  });
  return (
    <div className="max-h-[500px] h-full w-full overflow-scroll">
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th
                key={head}
                className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
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
              <tr key={data.id}>
                <td className={`${classes}`}>
                  <p className="font-normal text-[14px]">{data.id}</p>
                </td>
                <td className={`${classes}`}>
                  <p className="font-normal text-[14px]">{data.date}</p>
                </td>
                <td className={`${classes}`}>
                  <p className="font-normal text-[14px]">{data.gross}</p>
                </td>
                <td className={`${classes}`}>
                  <p className="font-normal text-[14px]">{data.net}</p>
                </td>
                <td className={`${classes} flex items-center space-x-2`}>
                  <p className="font-normal text-[14px]">{data.type}</p>
                  <FiArrowDownLeft className="text-green-600" />
                </td>
                <td className={`${classes}`}>
                  <p className="font-normal text-[14px] px-4 py-1 rounded-full text-white bg-green-600 w-fit">
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
