import { DatumValue } from "@nivo/line";

// components/dashboard/overview/SalesTooltip.tsx
type SalesTooltipProps = {
  point: {
    data: {
      xFormatted: string | number;
      yFormatted: string | number;
      y: DatumValue;
    };
    serieId: string | number;
  };
};

export function SalesTooltip({ point }: SalesTooltipProps) {
  return (
    <div className="min-w-[180px] rounded bg-dark px-4 py-3 shadow-xl">
      {/* Context */}
      <p className="mb-1 text-xs uppercase tracking-wide text-neutral-400">
        {point.data.xFormatted}
      </p>

      {/* Main value */}
      <p className="text-lg font-semibold text-white">
        {point.data.yFormatted}
      </p>

      {/* Description */}
      <p className="mt-1 text-xs text-neutral-400">
        Revenue generated this period
      </p>

      {/* Divider */}
      <div className="my-2 h-px bg-neutral-700" />

      {/* Meta */}
      <div className="flex justify-between text-xs text-neutral-400">
        <span>Series</span>
        <span className="capitalize">{point.serieId}</span>
      </div>
    </div>
  );
}
