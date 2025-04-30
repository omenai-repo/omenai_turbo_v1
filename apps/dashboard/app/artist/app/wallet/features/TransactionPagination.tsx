import { Pagination } from "@mantine/core";
import { fetchWalletTransactions } from "@omenai/shared-services/wallet/fetchWalletTransactions";
import { walletTransactionStore } from "@omenai/shared-state-store/src/artist/wallet/WalletTransactionStateStore";
import React, { useState } from "react";

export default function TransactionPagination({
  wallet_id,
  pageCount,
}: {
  wallet_id: string;
  pageCount: number;
}) {
  const { setTransactions, setTransactionLoading } = walletTransactionStore();

  const now = new Date().getFullYear().toString();
  const [year, setYear] = useState(now);
  const [page, setPage] = useState(1);
  const handlePaginationChange = async (pageVal: number) => {
    try {
      setTransactionLoading(true);
      const wallet_transaction_response = await fetchWalletTransactions(
        wallet_id,
        year,
        pageVal.toString(),
        "10",
        "all"
      );

      if (
        wallet_transaction_response === undefined ||
        !wallet_transaction_response.isOk
      )
        throw new Error(
          "Error fetching wallet transaction data. Please try again or contact support"
        );

      setTransactions(wallet_transaction_response.data);
    } catch (error) {
      throw new Error("Error fetching transaction data");
    } finally {
      setTransactionLoading(false);
    }
  };
  return (
    <div className="w-full flex justify-center">
      <Pagination
        color="#1a1a1a"
        size="md"
        withEdges
        total={pageCount}
        value={page}
        onChange={(val: number) => {
          setPage(val);
          handlePaginationChange(val);
        }}
        onNextPage={() => setPage(page + 1)}
        onPreviousPage={() => setPage(page - 1)}
        mt="xl"
      />
    </div>
  );
}
