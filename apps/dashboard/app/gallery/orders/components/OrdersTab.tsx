"use client";

export default function OrdersTab({ tab, setTab }: { tab: any; setTab: any }) {
  return (
    <div className="py-2 flex gap-x-2 w-fit">
      {/* User */}
      <div
        className={`px-4 py-2 rounded-full ring-1 ring-[#E0E0E0]  cursor-pointer w-fit grid place-items-center text-xs p-2 ${
          tab === "pending" ? "bg-dark text-white" : "bg-[#FAFAFA] text-dark"
        }  cursor-pointer `}
        onClick={() => setTab("pending")}
      >
        <p>Pending</p>
      </div>
      {/* Gallery */}
      <div
        className={`px-4 py-2 rounded-full ring-1 ring-[#E0E0E0]  cursor-pointer w-fit text-xs grid place-items-center p-2 ${
          tab === "processing"
            ? "bg-dark  text-white"
            : "bg-[#FAFAFA] text-dark"
        }  cursor-pointer `}
        onClick={() => setTab("processing")}
      >
        <p>In progress</p>
      </div>
      <div
        className={`px-4 py-2 rounded-full ring-1 ring-[#E0E0E0]  cursor-pointer w-fit text-xs grid place-items-center p-2 ${
          tab === "completed" ? "bg-dark  text-white" : "bg-[#FAFAFA] text-dark"
        }  cursor-pointer `}
        onClick={() => setTab("completed")}
      >
        <p>Completed</p>
      </div>
    </div>
  );
}
