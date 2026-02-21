import {
  Mail,
  PackageCheck,
  Ruler,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

interface CarrierInterventionCardProps {
  orderId: string;
  carrier: string;
  hasDeclined: boolean;
  canBeRolled: boolean;
  onDecline: () => void;
  onSwitchToRolled: () => void;
  onTryCustomCrate: () => void;
}

export default function CarrierInterventionCard({
  orderId,
  carrier,
  hasDeclined,
  canBeRolled,
  onDecline,
  onSwitchToRolled,
  onTryCustomCrate,
}: CarrierInterventionCardProps) {
  if (hasDeclined) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 shrink-0">
            <AlertCircle className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              We completely understand.
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              This piece exceeds logistics partner hard size limits. We are
              currently building a dedicated feature for massive artworks just
              like yours! In the meantime, we need to handle this specific order
              manually to ensure your art arrives safely.
            </p>
            <a
              href={`mailto:support@omenai.com?subject=Freight Assistance Needed: Order ${orderId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" />
              Contact Support for manual assistance
            </a>
          </div>
        </div>
      </div>
    );
  }

  // THE HEADS UP PATH
  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-amber-900 mb-1">
            Exceeds shipping courier maximum size limits
          </h3>
          <p className="text-sm text-amber-700/80 leading-relaxed">
            The current packaging dimensions exceed our logistics partner hard
            size limits and will be rejected. To proceed with this order, please
            select an alternative option below.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Golden Path (Only shows if rolling actually solves the problem) */}
        {canBeRolled && (
          <button
            type="button"
            onClick={onSwitchToRolled}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm group-hover:text-emerald-900">
                  Ship it Rolled (Recommended)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  The safest, most affordable option. We&apos;ll recalculate for
                  a tube package.
                </p>
              </div>
            </div>
          </button>
        )}

        {/* DIY Path */}
        <button
          type="button"
          onClick={onTryCustomCrate}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-900">
                I can pack it in a smaller Custom Box
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter exact dimensions to see if your crate fits within shipping
                size limits.
              </p>
            </div>
          </div>
        </button>

        {/* Empathy Path */}
        <button
          type="button"
          onClick={onDecline}
          className="w-full text-center py-3 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-lg transition-colors mt-2"
        >
          I cannot reduce the size (Requires manual assistance)
        </button>
      </div>
    </div>
  );
}
