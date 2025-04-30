import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import { WalletTransactionModelSchemaTypes } from "@omenai/shared-types";
import { create } from "zustand";

type WalletTransactionStoreTypes = {
  transactions: (WalletTransactionModelSchemaTypes & {
    createdAt: string;
    updatedAt: string;
  })[];
  setTransactions: (
    data: (WalletTransactionModelSchemaTypes & {
      createdAt: string;
      updatedAt: string;
    })[]
  ) => void;
  transactionLoading: boolean;
  setTransactionLoading: (val: boolean) => void;
};

export const walletTransactionStore = create<WalletTransactionStoreTypes>(
  (set, get) => ({
    transactions: [],
    setTransactions: (
      data: (WalletTransactionModelSchemaTypes & {
        createdAt: string;
        updatedAt: string;
      })[]
    ) => {
      set({ transactions: data });
    },
    transactionLoading: false,
    setTransactionLoading: (val: boolean) => {
      set({ transactionLoading: val });
    },
  })
);
