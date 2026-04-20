import { AlertCircle } from "lucide-react";
import React from "react";
import cn from "clsx";

export default function AlertComponent({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 p-4 bg-yellow-200 rounded border border-slate-200",
        className,
      )}
    >
      <div className="flex gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-yellow-800 space-y-1">
          <p className="font-normal">{title}</p>
          <p>{children}</p>
        </div>
      </div>
    </div>
  );
}
