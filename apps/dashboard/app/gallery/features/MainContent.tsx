// components/layout/MainContent.tsx
import { ReactNode } from "react";
import Appbar from "../components/Appbar";

export function MainContent({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <Appbar />
      {children}
    </main>
  );
}
