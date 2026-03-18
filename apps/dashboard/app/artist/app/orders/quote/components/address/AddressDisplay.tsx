import { AddressTypes } from "@omenai/shared-types";
import { motion } from "framer-motion";
import { MapPin, Edit2, CheckCircle } from "lucide-react";

interface AddressDisplayProps {
  address: AddressTypes;
  isRecentlyUpdated: boolean;
  onEditClick: () => void;
}

export default function AddressDisplay({
  address,
  isRecentlyUpdated,
  onEditClick,
}: AddressDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 border border-neutral-200 rounded -lg bg-white shadow-sm flex flex-col gap-4"
    >
      {isRecentlyUpdated && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-start gap-2 bg-green-50 border border-green-100 p-3 rounded -lg text-green-800 text-sm mb-2"
        >
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p>
            <span className="font-normal block">
              Pickup address successfully updated.
            </span>
            This address is only used for this specific order.
          </p>
        </motion.div>
      )}

      <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
        <MapPin className="w-5 h-5 text-neutral-700" />
        <h3 className="text-fluid-xs font-normal text-neutral-900 tracking-tight">
          Pickup address
        </h3>
      </div>

      <div className="text-neutral-600 leading-relaxed text-fluid-xs">
        <p className="font-normal text-neutral-900">{address.address_line}</p>
        <p>
          {address.city}, {address.state} {address.zip}
        </p>
        <p>{address.country}</p>
      </div>

      {/* TODO: We can uncomment this later if change address feature becomes relevant for artists */}
      {/* <div className="pt-4 flex flex-col items-start gap-3 mt-2">
        <button
          onClick={onEditClick}
          type="button"
          className="flex items-center gap-2 text-fluid-xs font-normal text-dark bg-neutral-50 hover:bg-neutral-100 px-4 py-2.5 rounded -lg transition-colors border border-neutral-200"
        >
          Change pickup address for this order
        </button>
      </div> */}
    </motion.div>
  );
}
