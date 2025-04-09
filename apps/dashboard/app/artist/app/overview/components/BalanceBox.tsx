import React from "react";
import BalanceType from "./BalanceType";

export default function BalanceBox() {
  return (
    <div className="p-5 bg-dark text-white rounded-[20px] my-6 flex flex-col space-y-5">
      <div className="flex flex-col justify-center">
        <BalanceType type={"Available"} amount={"$65,533.24"} />
      </div>
      <div className="flex flex-col justify-center">
        <BalanceType type={"Pending"} amount={"$33,935.32"} />
      </div>
    </div>
  );
}
