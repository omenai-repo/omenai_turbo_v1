import { Suspense } from "react";
import { OrderCanceledPage } from "./CancelComponent";
export const dynamic = "force-dynamic";
export default function page() {
  return (
    <Suspense>
      <OrderCanceledPage />
    </Suspense>
  );
}
