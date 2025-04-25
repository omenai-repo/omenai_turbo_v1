"use client";
import PageTitle from "../components/PageTitle";
import PayoutDashboard from "./components/PayoutDashboard";
import NoVerificationBlock from "../components/NoVerificationBlock";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { auth_uri } from "@omenai/url-config/src/config";

export default function Payouts() {
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const url = auth_uri();
  if (session === undefined) router.replace(url);
  return (
    <div>
      <PageTitle title="Payout with Stripe" />
      {!session?.gallery_verified ? (
        <NoVerificationBlock
          gallery_name={session !== null ? (session?.name as string) : ""}
        />
      ) : (
        <PayoutDashboard />
      )}
    </div>
  );
}
