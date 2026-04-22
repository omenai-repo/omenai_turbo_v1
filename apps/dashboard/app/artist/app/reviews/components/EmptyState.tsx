import { Clock } from "lucide-react";

interface EmptyStateProps {
  activeTab: "ACTIVE" | "RESOLVED";
}

export default function EmptyState({ activeTab }: EmptyStateProps) {
  return (
    <div className="bg-white border border-neutral-200 border-dashed rounded p-12 text-center flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-neutral-50 rounded -full flex items-center justify-center mb-4">
        <Clock size={24} className="text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-dark">
        No {activeTab.toLowerCase()} proposals
      </h3>
      <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
        {activeTab === "ACTIVE"
          ? "When you propose a price outside the standard algorithm, its status will appear here."
          : "Your approved and declined proposals will be logged here for future reference."}
      </p>
    </div>
  );
}
