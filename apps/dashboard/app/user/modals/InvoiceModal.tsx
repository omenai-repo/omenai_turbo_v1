import ReceiptDrawer from "./InvoiceReceiptModal";

import { AnimatePresence } from "framer-motion";

export default function InvoiceDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  invoiceNumber,
}: {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (value: boolean) => void;
  invoiceNumber: string;
}) {
  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <ReceiptDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          invoiceNumber={invoiceNumber}
        />
      )}
    </AnimatePresence>
  );
}
