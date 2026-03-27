"use client";

// Ambient skeletons — text-proportion placeholders, barely-there pulse
// No shimmer boxes. Just the ghost of a number and its label.

function SkeletonNumber({ cols = 4 }: { cols?: 2 | 3 | 4 }) {
  const gridCols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[
    cols
  ];
  return (
    <div
      className={`grid ${gridCols} divide-x divide-[rgba(0,0,0,0.055)] mb-10 animate-pulse`}
    >
      {[...Array(cols)].map((_, i) => (
        <div key={i} className="py-6 px-7">
          <div className="h-[9px] w-20 bg-[rgba(0,0,0,0.05)] rounded mb-3" />
          <div className="h-[34px] w-28 bg-[rgba(0,0,0,0.05)] rounded mb-2.5" />
          <div className="h-[10px] w-24 bg-[rgba(0,0,0,0.04)] rounded" />
        </div>
      ))}
    </div>
  );
}

function SkeletonChart({ height = "h-64" }: { height?: string }) {
  return (
    <div
      className={`rounded-lg bg-[rgba(74,127,181,0.03)] p-7 animate-pulse ${height}`}
    >
      <div className="h-[9px] w-24 bg-[rgba(0,0,0,0.05)] rounded mb-6" />
      <div className="flex items-end gap-1 h-32 opacity-20">
        {[55, 75, 45, 88, 62, 94, 70, 82, 58, 76, 90, 66].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-[rgba(74,127,181,0.4)] rounded-t-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function FinancialSkeleton() {
  return (
    <div>
      <SkeletonNumber cols={4} />
      <div className="grid grid-cols-2 gap-6">
        <SkeletonChart height="h-80" />
        <SkeletonChart height="h-80" />
      </div>
    </div>
  );
}

export function AcquisitionSkeleton() {
  return (
    <div>
      <SkeletonNumber cols={3} />
      <div className="mb-6">
        <SkeletonChart height="h-24" />
      </div>
      <SkeletonChart height="h-72" />
    </div>
  );
}

export function OperationalSkeleton() {
  return (
    <div>
      <SkeletonNumber cols={3} />
      <div className="grid grid-cols-2 gap-6">
        <SkeletonChart height="h-72" />
        <SkeletonChart height="h-72" />
      </div>
    </div>
  );
}

export function EngagementSkeleton() {
  return (
    <div>
      <SkeletonNumber cols={3} />
      <div className="grid grid-cols-3 gap-6">
        <SkeletonChart height="h-72 col-span-2" />
        <SkeletonChart height="h-72" />
      </div>
    </div>
  );
}
