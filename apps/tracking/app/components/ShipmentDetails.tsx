"use client";

import { TrackingStatus } from "@omenai/shared-types";
import {
  Package,
  Truck,
  Hash,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface ShipmentDetailsProps {
  trackingId: string;
  service: string;
  status: TrackingStatus;
  date: string;
  time: string;
}

export default function ShipmentDetails({
  trackingId,
  service,
  status,
  date,
  time,
}: ShipmentDetailsProps) {
  // Dynamic Status Styling
  const getStatusColor = (s: string) => {
    switch (s) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "EXCEPTION":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "CREATED":
        return "bg-slate-50 text-slate-700 border-slate-100";
      default:
        return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
              <Package className="w-5 h-5 text-slate-900" />
            </div>
            <h3 className="font-semibold text-slate-900">Shipment Overview</h3>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(status)}`}
          >
            {status === "DELIVERED" && <CheckCircle className="w-3 h-3" />}
            {status === "EXCEPTION" && <AlertTriangle className="w-3 h-3" />}
            {status === "IN_TRANSIT" && <Truck className="w-3 h-3" />}
            {status.replace("_", " ")}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Tracking ID */}
          <div className="p-6 group hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                <Hash className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tracking ID
                </p>
                <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">
                  {trackingId}
                </p>
              </div>
            </div>
          </div>

          {/* Service */}
          <div className="p-6 group hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Carrier
                </p>
                <p className="text-sm font-bold text-slate-900">{service}</p>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="p-6 group hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Last Update
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {date} <span className="text-slate-400 font-normal">at</span>{" "}
                  {time}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
