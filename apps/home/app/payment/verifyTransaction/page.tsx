"use client";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { Suspense } from "react";
import VerifyTransactionWrapper from "./components/VerifyTransactionWrapper";

export const dynamic = "force-dynamic";
export default function page() {
  return (
    <div>
      <DesktopNavbar />
      <Suspense>
        <VerifyTransactionWrapper />
      </Suspense>
    </div>
  );
}
