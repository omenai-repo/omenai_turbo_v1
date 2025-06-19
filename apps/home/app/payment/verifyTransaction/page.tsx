"use client";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { Suspense } from "react";

import dynamic from "next/dynamic";

const VerifyTransactionWrapper = dynamic(
  () => import("./components/VerifyTransactionWrapper"),
  {
    ssr: false,
    loading: () => <div>Verifying transaction...</div>,
  }
);
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
