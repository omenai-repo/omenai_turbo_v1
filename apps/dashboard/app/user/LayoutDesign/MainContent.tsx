// components/layout/MainContent.tsx
import { ReactNode } from "react";

export function MainContent({ children }: { children: ReactNode }) {
  return <main className="flex-1 overflow-y-auto py-6 px-2">{children}</main>;
}
