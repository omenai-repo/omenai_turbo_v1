"use client";
import React, { useState } from "react";
import PageTitle from "../../components/PageTitle";
import VerifyOTP from "./VerifyOtp";
import WalletPinResetForm from "./ChangePin";

export default function ChangeWalletPin() {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  return (
    <div>
      <PageTitle title={isVerified ? "Update wallet pin" : "Verify OTP"} />
      {!isVerified ? (
        <VerifyOTP setVerification={setIsVerified} />
      ) : (
        <WalletPinResetForm />
      )}
    </div>
  );
}
