import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import VerifyTransactionWrapper from "./components/VerifyTransactionWrapper";
import { Suspense } from "react";
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
