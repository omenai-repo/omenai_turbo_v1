"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Accordion, Pagination, Paper, ScrollArea } from "@mantine/core";
import { WalletTransactionModelSchemaTypes } from "@omenai/shared-types";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Link from "next/link";
import { fetchWalletTransactions } from "@omenai/shared-services/wallet/fetchWalletTransactions";
import { walletTransactionStore } from "@omenai/shared-state-store/src/artist/wallet/WalletTransactionStateStore";
import TransactionHistorySkeleton from "@omenai/shared-ui-components/components/skeletons/TransactionHistorySkeleton";
export default function TransactionTable() {
  const { setTransactions, transactions, transactionLoading } =
    walletTransactionStore();

  const items = transactions.map(
    (
      transaction: WalletTransactionModelSchemaTypes & {
        createdAt: string;
        updatedAt: string;
      }
    ) => (
      <Accordion.Item
        key={transaction.trans_id}
        value={transaction.trans_id}
        className="px-5 py-2"
      >
        <Accordion.Control>
          <div className="flex gap-x-2 items-start">
            <Image
              src={"/omenai_logo_cut.png"}
              width={30}
              height={30}
              alt="Omenai logo cut"
              className="w-fit h-fit"
            />
            <div
              className="flex justify-between items-start cursor-pointer"
              key={transaction.trans_id}
            >
              <div className="flex flex-col space-y-1">
                <div>
                  <h2
                    className={`font-bold text-fluid-xxs ${transaction.trans_status === "PENDING" ? "text-blue-600" : transaction.trans_status === "FAILED" ? "text-red-600" : " text-green-600"}`}
                  >
                    Withdrawal{" "}
                    {transaction.trans_status === "PENDING"
                      ? "processing"
                      : transaction.trans_status.toLowerCase()}
                  </h2>
                  <p className="text-fluid-xxs">
                    {formatISODate(transaction.createdAt)}
                  </p>
                </div>
                <h1 className="font-semibold text-[14px]">
                  {formatPrice(transaction.trans_amount, "USD")}
                </h1>
              </div>
            </div>
          </div>
        </Accordion.Control>
        <Accordion.Panel>
          <Paper radius={"xl"} withBorder className="p-6 text-fluid-xxs">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-1">
                <span className="text-dark/70 text-fluid-xxs">
                  Transaction ID
                </span>
                <p className="font-medium">{transaction.trans_id}</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-dark/70 text-fluid-xxs">
                  Transaction Reference
                </span>
                <p className="font-medium">{transaction.trans_flw_ref_id}</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-dark/70 text-fluid-xxs">Amount</span>
                <p className="font-medium">
                  {formatPrice(transaction.trans_amount)}
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-dark/70 text-fluid-xxs">Date</span>
                <p className="font-medium">
                  {formatISODate(transaction.createdAt)}
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-dark/70 text-fluid-xxs">Status</span>
                <p
                  className={`font-semibold ${transaction.trans_status === "PENDING" ? "text-blue-600" : transaction.trans_status === "SUCCESSFUL" ? "text-green-600" : "text-red-600"}`}
                >
                  {transaction.trans_status}
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-dark/70 text-fluid-xxs">Message</span>

                <p className={`font-medium `}>
                  {transaction.trans_status === "PENDING" &&
                    "Your funds are on their way to your bank account. This may take a little time—thank you for your patience."}
                  {transaction.trans_status === "SUCCESSFUL" &&
                    "Your funds have been successfully deposited into your bank account"}
                  {transaction.trans_status === "FAILED" &&
                    "he funds transfer was unsuccessful. Please check your bank details or contact support for assistance"}
                </p>
              </div>
            </div>
          </Paper>
        </Accordion.Panel>
      </Accordion.Item>
    )
  );

  return (
    <>
      {transactionLoading ? (
        <TransactionHistorySkeleton />
      ) : (
        <Accordion
          transitionDuration={500}
          variant="separated"
          radius="xl"
          className="w-full"
        >
          {transactions.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center ring-1 ring-[#e0e0e0] rounded-xl">
              <NotFoundData />
            </div>
          ) : (
            <>
              <ScrollArea h={450}>{items}</ScrollArea>
            </>
          )}
        </Accordion>
      )}
    </>
  );
}
