"use client";

import BalanceBox from "./BalanceBox";

export default function PayoutDashBoardContent({
  account,
  balance,
}: {
  account: string;
  balance: any;
}) {
  return (
    <div>
      <BalanceBox account={account} balance={balance} />
    </div>
  );
}
