"use client";

export default function OrdersTab({ tab, setTab }: { tab: any; setTab: any }) {
  const GROUP_CLASSES =
    "w-full relative px-4 py-2 rounded font-normal transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 grid place-items-center text-fluid-xxs";
  return (
    <div className="py-2 flex items-center gap-x-2 w-full">
      {/* User */}
      <div
        className={`${GROUP_CLASSES} ${
          tab === "pending"
            ? "bg-transparent border-amber-600 border-2 text-dark shadow-md focus:ring-slate-500"
            : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 focus:ring-slate-400"
        }  cursor-pointer `}
        onClick={() => setTab("pending")}
      >
        <p>Orders</p>
      </div>
      {/* Gallery */}

      <div
        className={`${GROUP_CLASSES} ${
          tab === "completed"
            ? "bg-transparent border-green-600 border-2 text-dark shadow-md focus:ring-slate-500"
            : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 focus:ring-slate-400"
        }  cursor-pointer `}
        onClick={() => setTab("completed")}
      >
        <p>Order History</p>
      </div>
    </div>
  );
}
