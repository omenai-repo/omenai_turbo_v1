import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

export function PayoutSummary({
  table,
  currency,
}: {
  table: any[];
  currency: string;
}) {
  const totalGross = table.reduce(
    (sum, t) => sum + t.trans_pricing.unit_price,
    0
  );

  const totalNet = table.reduce(
    (sum, t) => sum + (t.trans_pricing.unit_price - t.trans_pricing.commission),
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 mb-4">
      <SummaryCard
        label="Gross earnings"
        value={formatPrice(totalGross, currency)}
      />
      <SummaryCard
        label="Net earnings"
        value={formatPrice(totalNet, currency)}
      />
      <SummaryCard label="Transactions" value={table.length.toString()} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-fluid-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
