import { Divider, Paper } from "@mantine/core";
import { WithdrawalAccount } from "@omenai/shared-types";
import Link from "next/link";
import React from "react";

export default function PrimaryWithdrawalAccount({
  withdrawal_account,
}: {
  withdrawal_account: WithdrawalAccount | null;
}) {
  return (
    <>
      {withdrawal_account === null ? (
        <div className="my-5">
          <Link
            className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
            href="/artist/app/wallet/add_primary_account"
          >
            Add primary account
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col space-y-2">
            <Paper
              radius="lg"
              className="flex flex-col space-y-6 p-5 my-6"
              withBorder
            >
              <p className=" font-semibold">Primary withdrawal account</p>
              <div className=" text-[14px] font-medium">
                <div className="flex justify-between items-center">
                  <p>Bank name</p>
                  <p>{withdrawal_account.bank_name.toUpperCase()}</p>
                </div>
                <Divider my="md" />
                <div className="flex justify-between items-center">
                  <p>Account number</p>
                  <p>{withdrawal_account.account_number}</p>
                </div>
                <Divider my="md" />
                <div className="flex justify-between items-center">
                  <p>Account name</p>
                  <p>{withdrawal_account.account_name}</p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  className="h-[35px] p-5 rounded-full w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
                  href="/artist/app/wallet/add_primary_account"
                >
                  Change primary account
                </Link>
              </div>
            </Paper>
          </div>
        </>
      )}
    </>
  );
}
