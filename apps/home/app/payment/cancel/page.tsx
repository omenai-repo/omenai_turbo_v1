import { Suspense } from "react";
import { OrderCanceledPage } from "./CancelComponent";

export default function page() {
  return (
    <Suspense>
      <OrderCanceledPage />
    </Suspense>
  );
}
