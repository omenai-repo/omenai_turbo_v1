import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  MapPin,
  Mail,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { InvoiceLineItemsData, InvoiceTypes } from "@omenai/shared-types";
import { downloadInvoiceFile } from "@omenai/shared-lib/storage/downloadFile";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { ReceiptSkeleton } from "@omenai/shared-ui-components/components/skeletons/InvoiceSkeleton";
import { fetchInvoice } from "@omenai/shared-services/invoice/fetchInvoice";
import { useQuery } from "@tanstack/react-query";
interface ReceiptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const ReceiptDrawer: React.FC<ReceiptDrawerProps> = ({
  isOpen,
  onClose,
  invoiceNumber,
}) => {
  // 1. Disable Background Scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const { data, isLoading: loading } = useQuery({
    queryKey: [`fetch_invoice_${invoiceNumber}`],
    queryFn: async () => {
      const response = await fetchInvoice(invoiceNumber);

      if (!response.isOk)
        toast_notif(
          "Something went wrong with fetching receipt details, please contact support",
          "error"
        );
      return response.data;
    },
    enabled: !!invoiceNumber && isOpen,
    staleTime: 60 * 5 * 1000,
  });

  const handleDownload = () => {
    const fileId = data?.storage?.fileId;
    if (!fileId) return;

    const downloadUrl = downloadInvoiceFile(fileId);

    if (!downloadUrl) {
      toast_notif("Receipt file not found, please contact support", "error");
      return;
    }
    // Constructing the download URL

    // Logic to force download in browser
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.download = `Invoice-${data.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      {/* 1. Backdrop - Renders immediately */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full md:w-[30%] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {loading || !data ? (
          <ReceiptSkeleton />
        ) : (
          <div className="flex flex-col h-full">
            {/* Render your real Receipt UI here using 'data' */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 text-fluid-xs">
                  Receipt Details
                </h2>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                  #{data.invoiceNumber}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-900 text-fluid-xs"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Status Badge */}
              {data.receipt_sent && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-md p-4 flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-fluid-xxs font-medium text-emerald-900">
                      Receipt delivered via mail
                    </p>
                    <p className="text-xs text-emerald-600">
                      Sent on {format(new Date(data.paidAt), "PPP")}
                    </p>
                  </div>
                </div>
              )}

              {/* Total Amount Hero */}
              <div className="text-center py-2">
                <p className="text-fluid-xxs text-gray-500 mb-1">
                  Total Amount Paid
                </p>
                <h1 className="text-fluid-xl font-extrabold text-gray-900">
                  {formatCurrency(data.pricing.total, data.currency)}
                </h1>
              </div>

              {/* Recipient Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Billed To
                </h3>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-500">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-fluid-xs">
                        {data.recipient.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-500">
                      <Mail size={16} />
                    </div>
                    <p className="text-fluid-xxs text-gray-600">
                      {data.recipient.email}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-500">
                      <MapPin size={16} />
                    </div>
                    <p className="text-fluid-xxs text-gray-600 leading-relaxed">
                      {data.recipient.address.address_line},<br />
                      {data.recipient.address.city},{" "}
                      {data.recipient.address.state}{" "}
                      {data.recipient.address.zip}
                      <br />
                      {data.recipient.address.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Line Items
                </h3>
                <div className="">
                  {data.lineItems.map(
                    (item: InvoiceLineItemsData, index: number) => (
                      <div
                        key={item.description}
                        className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-fluid-xs">
                            {item.description}
                          </p>
                          <p className="text-fluid-xxs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900 text-fluid-xs">
                          {formatCurrency(item.unitPrice, data.currency)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <div className="flex justify-between text-fluid-xxs text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    {formatCurrency(data.pricing.unitPrice, data.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-fluid-xxs text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {formatCurrency(data.pricing.shipping, data.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-fluid-xxs text-gray-600">
                  <span>Taxes</span>
                  <span>
                    {formatCurrency(data.pricing.taxes, data.currency)}
                  </span>
                </div>

                <div className="flex justify-between text-fluid-xxs text-green-600">
                  <span>Discount</span>
                  <span>
                    -{formatCurrency(data.pricing.discount, data.currency)}
                  </span>
                </div>

                <div className="h-px bg-slate-300 my-2" />
                <div className="flex justify-between font-bold text-gray-900 text-fluid-xs text-lg">
                  <span>Total</span>
                  <span>
                    {formatCurrency(data.pricing.total, data.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* --- Footer Actions --- */}
            <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
              <button
                onClick={onClose}
                className="w-full py-2 px-4 rounded-md text-fluid-xs border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="w-full py-2 px-4 rounded-md text-fluid-xs bg-dark text-white font-normal hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
              >
                <Download size={18} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ReceiptDrawer;
