import React from "react";
import PromotionalList from "./components/PromotionalList";
import { AddPromotionalModal } from "./modals/AddPromotionalModal";
export const dynamic = "force-dynamic";
export default function page() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-fluid-md font-semibold">Your Promotionals</h1>
        <AddPromotionalModal />
      </div>
      <div className="pb-3">
        <PromotionalList />
      </div>
    </div>
  );
}
