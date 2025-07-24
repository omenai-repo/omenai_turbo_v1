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
import Link from "next/link";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
export default function Wallet() {
  const { user } = useAuth({ requiredRole: "artist" });
  const { toggleWalletPinPopup } = artistActionStore();
  const { setTransactions } = walletTransactionStore();
  const {
    data: wallet_data,
    isLoading: loading,
    isSuccess,
  } = useQuery({
    queryKey: ["fetch_wallet_screen"],
    queryFn: async () => {
      const now = new Date().getFullYear().toString();
      const response = await fetchWallet(user.artist_id);

      if (response === undefined || !response.isOk)
        throw new Error(
          "Error fetching wallet data. Please try again or contact support"
        );

      const wallet_transaction_response = await fetchWalletTransactions(
        response.data.wallet_id,
        now,
        "1",
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

      return {
        wallet: response.data,
        transaction_page_count: wallet_transaction_response.pageCount,
      };
    },
    refetchOnWindowFocus: false,
  });

  // 👇 Add this useEffect
  useEffect(() => {
    if (isSuccess && wallet_data.wallet.wallet_pin == null) {
      toggleWalletPinPopup(true);
    }
  }, [isSuccess, wallet_data, toggleWalletPinPopup]);

  return (
    <div className="flex flex-col space-y-5">
      <PageTitle title="Wallet" />

      {loading ? (
        <WalletSkeleton />
      ) : (
        <div className="grid xl:grid-cols-2 gap-8">
          <div className="col-span-1">
            <Balances
              available={wallet_data?.wallet.available_balance}
              pending={wallet_data?.wallet.pending_balance}
              currency={wallet_data?.wallet.base_currency}
              withdrawal_account={
                wallet_data?.wallet.primary_withdrawal_account
              }
            />
            <div className="flex flex-col space-y-3">
              <PrimaryWithdrawalAccount
                withdrawal_account={
                  wallet_data?.wallet.primary_withdrawal_account
                }
              />
            </div>
          </div>

          <div className="col-span-1 relative">
            <TransactionTable />
            <div className="absolute bottom-0 flex w-full justify-center mb-4">
              <TransactionPagination
                wallet_id={wallet_data?.wallet.wallet_id}
                pageCount={wallet_data?.transaction_page_count}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
