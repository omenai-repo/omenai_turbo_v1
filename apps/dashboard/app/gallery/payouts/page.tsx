"use client";
import PageTitle from "../components/PageTitle";
import PayoutDashboard from "./components/PayoutDashboard";
import NoVerificationBlock from "../components/NoVerificationBlock";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { auth_uri } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function Payouts() {
  const { user } = useAuth({ requiredRole: "gallery" });

  return (
    <div>
      <PageTitle title="Payout with Stripe" />
      {!user.gallery_verified ? (
        <NoVerificationBlock gallery_name={user.name} />
      ) : (
        <PayoutDashboard />
      )}
    </div>
  );
}
