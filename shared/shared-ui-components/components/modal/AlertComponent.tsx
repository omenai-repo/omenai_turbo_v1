import { AlertCircle } from "lucide-react";
import React from "react";

export default function AlertComponent({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mt-6 p-4 bg-dark/20-50 rounded border border-dark/40">
      <div className="flex gap-3">
        <AlertCircle className="w-4 h-4 text-dark/20-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-dark/20-600 space-y-1">
          <p className="font-normal">{title}</p>
          <p>{children}</p>
        </div>
      </div>
    </div>
  );
}
