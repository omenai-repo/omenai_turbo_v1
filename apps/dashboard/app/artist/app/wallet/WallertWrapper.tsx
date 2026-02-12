"use client";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../components/PageTitle";
import Balances from "./features/Balances";
import PrimaryWithdrawalAccount from "./features/PrimaryWithdrawalAccount";
import TransactionTable from "./features/TransactionTable";
import { fetchWallet } from "@omenai/shared-services/wallet/fetchWallet";
import { fetchWalletTransactions } from "@omenai/shared-services/wallet/fetchWalletTransactions";
import WalletSkeleton from "@omenai/shared-ui-components/components/skeletons/WalletSkeleton";
import { useEffect, useState } from "react";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { walletTransactionStore } from "@omenai/shared-state-store/src/artist/wallet/WalletTransactionStateStore";
import TransactionPagination from "./features/TransactionPagination";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function Wallet() {
  const { user } = useAuth({ requiredRole: "artist" });
  const { toggleWalletPinPopup } = artistActionStore();
  const { setTransactions } = walletTransactionStore();

  // Lifted State
  const [currentYear, setCurrentYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [pageCount, setPageCount] = useState<number>(1);

  const {
    data: wallet_data,
    isLoading: loading,
    isSuccess,
  } = useQuery({
    queryKey: ["fetch_wallet_screen"],
    queryFn: async () => {
      // 1. Fetch Wallet
      const response = await fetchWallet(user.artist_id);
      if (!response?.isOk)
        throw new Error(
          "Error fetching wallet data. Please try again or contact support",
        );

      // 2. Fetch Initial Transactions (using currentYear state)
      const wallet_transaction_response = await fetchWalletTransactions(
        response.data.wallet_id,
        currentYear,
        "1",
        "10",
        "all",
      );

      if (!wallet_transaction_response?.isOk)
        throw new Error("Error fetching wallet transaction data.");

      // 3. Update Store & Local State
      setTransactions(wallet_transaction_response.data);
      setPageCount(wallet_transaction_response.pageCount);

      return {
        wallet: response.data,
      };
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isSuccess && wallet_data?.wallet.wallet_pin == null) {
      toggleWalletPinPopup(true);
    }
  }, [isSuccess, wallet_data, toggleWalletPinPopup]);

  return (
    <div className="flex flex-col space-y-8 pb-10">
      <PageTitle title="Wallet" />

      {loading ? (
        <WalletSkeleton />
      ) : (
        <div className="grid xl:grid-cols-2 gap-8 items-start">
          {/* Left Column: Balances */}
          <div className="col-span-1 space-y-6">
            <Balances
              available={wallet_data?.wallet.available_balance}
              pending={wallet_data?.wallet.pending_balance}
              currency={wallet_data?.wallet.base_currency}
              withdrawal_account={
                wallet_data?.wallet.primary_withdrawal_account
              }
            />
            <PrimaryWithdrawalAccount
              withdrawal_account={
                wallet_data?.wallet.primary_withdrawal_account
              }
            />
          </div>

          {/* Right Column: Transactions */}
          <div className="col-span-1 flex flex-col h-full">
            <TransactionTable
              walletId={wallet_data?.wallet.wallet_id || ""}
              currentYear={currentYear}
              onYearChange={(year, newPageCount) => {
                setCurrentYear(year);
                setPageCount(newPageCount);
              }}
            />

            {/* Only show pagination if there are pages */}
            {pageCount > 1 && (
              <div className="mt-6 flex justify-center">
                <TransactionPagination
                  wallet_id={wallet_data?.wallet.wallet_id || ""}
                  pageCount={pageCount}
                  currentYear={currentYear}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
