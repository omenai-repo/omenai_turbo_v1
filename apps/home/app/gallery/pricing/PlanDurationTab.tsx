"use client";

export default function PlanDurationTab({
  tab,
  setTab,
}: {
  tab: any;
  setTab: any;
}) {
  return (
    <div className="py-2 w-full flex justify-center gap-x-2 mt-4">
      {/* User */}
      <div
        role="button"
        className={`px-4 py-2 rounded ring-1 ring-[#E0E0E0]  cursor-pointer w-fit grid place-items-center text-fluid-xxs p-2 ${
          tab === "monthly" ? "bg-dark text-white" : "bg-[#FAFAFA] text-dark"
        }  cursor-pointer `}
        onClick={() => setTab("monthly")}
      >
        <p>Monthly</p>
      </div>
      {/* Gallery */}
      <div
        role="button"
        className={`px-4 py-2 rounded ring-1 ring-[#E0E0E0]  cursor-pointer w-fit text-fluid-xxs grid place-items-center p-2 ${
          tab === "yearly" ? "bg-dark  text-white" : "bg-[#FAFAFA] text-dark"
        }  cursor-pointer `}
        onClick={() => setTab("yearly")}
      >
        <p>Annually</p>
      </div>
    </div>
  );
}
