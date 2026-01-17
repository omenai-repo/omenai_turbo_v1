import React from "react";
import PromotionalList from "./components/PromotionalList";
import { AddPromotionalModal } from "./modals/AddPromotionalModal";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <section className="space-y-6">
      {/* Page header */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-neutral-900">
            Promotionals
          </h1>
          <p className="text-sm text-neutral-500">
            Create and manage promotional incentives across the platform
          </p>
        </div>

        <AddPromotionalModal />
      </header>

      {/* Content surface */}
      <div className="rounded border border-neutral-200 bg-white shadow-sm">
        <div className="p-4">
          <PromotionalList />
        </div>
      </div>
    </section>
  );
}
