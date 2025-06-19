import React from "react";

export default function CardChangeCheckoutItem() {
  return (
    <div className="bg-white shadow-lg">
      <div className="w-full p-5 bg-dark rounded-full text-white">
        <h1 className="text-fluid-base font-normal ">Card change</h1>
      </div>

      <div className="p-5 rounded-[10px]">
        <p className="text-[13px] font-bold text-red-600">
          NOTE: A small, temporary charge of $1 will be applied to verify your
          card. This charge will be refunded to you immediately.
        </p>
      </div>
    </div>
  );
}
