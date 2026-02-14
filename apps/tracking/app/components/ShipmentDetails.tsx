"use client";

import { Package, Truck, Hash, Clock } from "lucide-react";

interface ShipmentDetailsProps {
  trackingId: string;
  service: string;
  date: string;
  time: string;
}

export default function ShipmentDetails({
  trackingId,
  service,
  date,
  time,
}: ShipmentDetailsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Shipment Overview</h3>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Tracking ID */}
          <div className="p-6 group hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Hash className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tracking ID
                </p>
                <p className="text-sm font-bold text-slate-900 break-all font-mono">
                  {trackingId}
                </p>
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div className="p-6 group hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Carrier Service
                </p>
                <p className="text-sm font-bold text-slate-900">{service}</p>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="p-6 group hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Last Updated
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
