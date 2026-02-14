import { Pagination } from "@mantine/core";
import { fetchWalletTransactions } from "@omenai/shared-services/wallet/fetchWalletTransactions";
import { walletTransactionStore } from "@omenai/shared-state-store/src/artist/wallet/WalletTransactionStateStore";
import { useRollbar } from "@rollbar/react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export default function TransactionPagination({
  wallet_id,
  pageCount,
  currentYear,
}: {
  wallet_id: string;
  pageCount: number;
  currentYear: string;
}) {
  const { setTransactions, setTransactionLoading } = walletTransactionStore();
  const [page, setPage] = useState(1);
  const rollbar = useRollbar();

  // Reset page to 1 if the year changes
  useEffect(() => {
    setPage(1);
  }, [currentYear]);

  const handlePaginationChange = async (pageVal: number) => {
    try {
      setTransactionLoading(true);
      const response = await fetchWalletTransactions(
        wallet_id,
        currentYear, // Uses the year from parent state
        pageVal.toString(),
        "10",
        "all",
      );

      if (!response?.isOk)
        throw new Error(response?.message || "Error fetching transaction data");

      setTransactions(response.data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      rollbar.error(err);
      toast.error("Error", { description: "Failed to load page" });
    } finally {
      setTransactionLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Pagination
        total={pageCount}
        value={page}
        onChange={(val: number) => {
          setPage(val);
          handlePaginationChange(val);
        }}
        size="sm"
        radius="md"
        withEdges
        color="dark"
        classNames={{
          control: "border-slate-200 text-slate-600",
        }}
      />
    </div>
  );
}
