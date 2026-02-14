"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useRollbar } from "@rollbar/react";
import { toast } from "sonner";
import {
  Button,
  TextInput,
  Paper,
  Title,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Container,
  Grid,
  ThemeIcon,
  Badge,
} from "@mantine/core";

import {
  BankBranchType,
  BankType,
  WithdrawalAccount,
} from "@omenai/shared-types";
import { validateBankAccount } from "@omenai/shared-services/wallet/validateAccount";
import { addPrimaryAccount } from "@omenai/shared-services/wallet/addPrimaryAccount";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

import { SearchableSelect } from "./SearchableComboBox";
import { Building, Check, RefreshCcw, Shield, ShieldClose } from "lucide-react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

const COUNTRIES_WITH_BANK_BRANCHES = [
  "BJ",
  "CM",
  "TD",
  "CI",
  "CG",
  "GA",
  "GH",
  "MW",
  "RW",
  "SN",
  "SL",
  "TZ",
  "UG",
];

export default function AccountForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const rollbar = useRollbar();
  const { user, csrf } = useAuth({ requiredRole: "artist" });

  // --- State ---
  const [selectedBank, setSelectedBank] = useState<BankType | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BankBranchType | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");

  const [validatedAccount, setValidatedAccount] = useState<{
    isValidated: boolean;
    account_name: string;
    account_number: string;
  } | null>(null);

  // --- Derived State ---
  const showBranches = useMemo(() => {
    return (
      user?.address?.countryCode &&
      selectedBank !== null &&
      COUNTRIES_WITH_BANK_BRANCHES.includes(user.address.countryCode)
    );
  }, [user, selectedBank]);

  // --- Handlers ---

  const handleReset = useCallback(() => {
    setSelectedBank(null);
    setSelectedBranch(null);
    setAccountNumber("");
    setValidatedAccount(null);
    toast.info("Form reset", { description: "Fields have been cleared." });
  }, []);

  const handleBankChange = useCallback(
    (value: BankType | BankBranchType | null) => {
      setSelectedBank(value as BankType);
      setSelectedBranch(null); // Reset branch when bank changes
      setValidatedAccount(null); // Invalidate previous verification
    },
    [],
  );

  const handleBranchChange = useCallback(
    (value: BankType | BankBranchType | null) => {
      setSelectedBranch(value as BankBranchType);
    },
    [],
  );

  const handleAccountNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setAccountNumber(event.currentTarget.value);
    if (validatedAccount) setValidatedAccount(null); // Reset validation on edit
  };

  const handleValidateAccount = async () => {
    if (!selectedBank || !accountNumber) {
      toast_notif("Bank and Account Number are required.", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await validateBankAccount(
        selectedBank.code,
        accountNumber,
        csrf || "",
      );

      if (!response?.isOk) {
        toast_notif(response?.message || "Could not validate account", "error");

        return;
      }

      setValidatedAccount({
        isValidated: true,
        ...response.data,
      });
      toast.success("Account Verified", {
        description: `Account Name: ${response.data.account_name}`,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      rollbar.error(err);
      toast_notif("System error, please try again later", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrimaryAccount = async () => {
    if (!selectedBank || !validatedAccount) return;

    try {
      setLoading(true);
      const account_details: Omit<WithdrawalAccount, "beneficiary_id"> = {
        account_number: validatedAccount.account_number,
        bank_name: selectedBank.name,
        account_name: validatedAccount.account_name,
        bank_id: selectedBank.id,
        bank_code: selectedBank.code,
        branch: selectedBranch,
        bank_country: user.address.countryCode,
      };

      const response = await addPrimaryAccount({
        owner_id: user.artist_id,
        account_details,
        base_currency: user.base_currency,
        token: csrf || "",
      });

      if (!response?.isOk) {
        toast_notif(response.message, "error");
        return;
      }

      toast_notif(response.message, "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_wallet_screen"],
      });
      router.replace("/artist/app/wallet");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      rollbar.error(err);
      toast_notif("Failed to save account details.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-auto w-full flex bg-slate-50 overflow-hidden">
      {/* LEFT SIDE: Form Area */}
      <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col justify-center px-8 lg:px-12 py-8 bg-white shadow-xl z-10 overflow-y-auto">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div>
            <Group justify="space-between" align="start">
              <ThemeIcon size={48} radius="md" variant="light" color="blue">
                <Building size={28} />
              </ThemeIcon>

              <Tooltip label="Reset Form">
                <ActionIcon
                  variant="subtle"
                  color="slate"
                  onClick={handleReset}
                  size="lg"
                  aria-label="Reset form w-auto"
                >
                  <RefreshCcw size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Title size={"xl"} order={2} className="py-3 text-slate-900">
              Connect Bank Account
            </Title>
            <Text c="dimmed" size="sm" className="mt-2">
              Link your primary bank account to receive payouts securely.
            </Text>
          </div>

          <form className="flex flex-col space-y-4">
            <TextInput
              label="Country"
              value={user.address.country}
              disabled
              size="sm"
              classNames={{
                input: "bg-slate-50 text-slate-500 border-slate-200",
              }}
              rightSection={<Check size={16} className="text-green-500" />}
            />

            <SearchableSelect
              type="banks"
              selectedItem={selectedBank}
              onChange={handleBankChange}
              disabled={!!validatedAccount?.isValidated}
            />

            {showBranches && (
              <SearchableSelect
                type="branches"
                selectedItem={selectedBranch}
                onChange={handleBranchChange}
                bankCode={selectedBank ? String(selectedBank.id) : ""}
                disabled={!selectedBank || !!validatedAccount?.isValidated}
              />
            )}

            <TextInput
              label="Account Number"
              placeholder="0000000000"
              value={accountNumber}
              onChange={handleAccountNumberChange}
              disabled={!!validatedAccount?.isValidated}
              size="sm"
              withAsterisk
              classNames={{ label: "mb-1 font-medium text-slate-700" }}
            />

            {validatedAccount?.isValidated && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                <Text
                  size="xs"
                  c="green.8"
                  fw={500}
                  tt="uppercase"
                  className="mb-1"
                >
                  Verified Account Name
                </Text>
                <Text size="sm" fw={700} c="green.9">
                  {validatedAccount.account_name}
                </Text>
              </div>
            )}

            <div className="pt-4">
              {!validatedAccount?.isValidated ? (
                <Button
                  onClick={handleValidateAccount}
                  fullWidth
                  size="sm"
                  color="dark"
                  loading={loading}
                  disabled={!accountNumber || !selectedBank}
                >
                  Validate Account
                </Button>
              ) : (
                <Button
                  onClick={handleAddPrimaryAccount}
                  fullWidth
                  size="sm"
                  color="dark"
                  loading={loading}
                  leftSection={<Shield size={18} />}
                >
                  Confirm & Link Account
                </Button>
              )}
            </div>
          </form>

          <div className="pt-6 border-t border-slate-100">
            <Group justify="center" gap="xs">
              <ShieldClose size={14} className="text-slate-400" />
              <Text size="xs" c="dimmed">
                Your banking information is encrypted and secure.
              </Text>
            </Group>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Visual/Decorative Area */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-2/3 bg-slate-900 relative overflow-hidden items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />

        {/* Content Card */}
        <div className="relative z-10 max-w-lg">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-12 rounded-2xl shadow-2xl">
            <Badge variant="filled" color="blue" size="md" className="mb-6">
              Secure Payouts
            </Badge>
            <Title className="text-white text-5xl font-light mb-6 leading-tight">
              Seamless Wallet <br />
              <span className="font-bold text-blue-400">Payouts</span>
            </Title>
            <Text c={"white"} className="text-white text-md leading-relaxed">
              Connect your local bank account to receive funds directly in your
              currency. We support secure transfers across the continent with
              real-time validation.
            </Text>

            <div className="mt-10 flex gap-4">
              <div className="h-2 w-20 bg-blue-500 rounded-full" />
              <div className="h-2 w-4 bg-slate-600 rounded-full" />
              <div className="h-2 w-4 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
