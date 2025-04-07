import React from "react";

export default function BalanceBox() {
  return (
    <div className="p-5 bg-dark text-white rounded-[20px] my-6 flex flex-col space-y-5">
      <div className="flex flex-col justify-center">
        <p className="text-xs font-light">Pending Balance</p>
        <h1 className="font-normal text-sm">$56,900.00</h1>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-light">Available Balance</p>
        <h1 className="font-normal text-sm">$96,500.00</h1>
      </div>
    </div>
  );
}
