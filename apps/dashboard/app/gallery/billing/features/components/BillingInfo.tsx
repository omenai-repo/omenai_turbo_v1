"use client";

import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { useContext } from "react";

export default function BillingInfo() {
  const { session } = useContext(SessionContext);
  return (
    <div className="p-4 border border-dark/20 rounded-lg w-full h-[250px]">
      <p className="text-dark text-xs font-semibold">Billing Info</p>

      <div className="flex flex-col gap-2 text-xs mt-5">
        {/* <h4 className="text-sm">{session.data?.user.name}</h4> */}
        <p>
          Gallery name: <span className="font-normal">{session?.name}</span>{" "}
        </p>
        <p>
          Email address: <span className="font-normal">{session?.email}</span>{" "}
        </p>
      </div>
    </div>
  );
}
