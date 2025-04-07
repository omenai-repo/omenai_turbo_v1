import React from "react";
import CurrencyDropdown from "../components/CurrencyDropdown";
import BalanceBox from "../components/BalanceBox";

export default function Balances() {
  return (
    <div className="p-5">
      <div className="w-full flex justify-between items-center">
        <h3 className="font-medium">Wallet Balance</h3>
        {/* Dropdown for currency */}
        <CurrencyDropdown />
      </div>
      <BalanceBox />
    </div>
  );
}
