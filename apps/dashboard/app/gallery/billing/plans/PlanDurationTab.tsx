"use client";

export default function PlanDurationTab({
  tab,
  setTab,
}: {
  tab: "monthly" | "yearly";
  setTab: (val: "monthly" | "yearly") => void;
}) {
  return (
    <div className="relative inline-flex items-center border border-[#DDD8D0] rounded-full p-[3px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {/* Sliding indicator */}
      <span
        aria-hidden
        className="absolute inset-y-[3px] rounded-full bg-dark transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: "calc(50% - 3px)",
          left: tab === "monthly" ? "3px" : "calc(50%)",
        }}
      />

      {(["monthly", "yearly"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTab(t)}
          className={`
            relative z-10 px-7 py-2 rounded-full
            text-[11px] tracking-[0.18em] uppercase
            transition-colors duration-200 select-none
            ${tab === t ? "text-white" : "text-[#8A8580]"}
          `}
        >
          {t === "monthly" ? "Monthly" : "Annual"}
        </button>
      ))}
    </div>
  );
}
