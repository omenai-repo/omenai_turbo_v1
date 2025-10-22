"use client";
import { createContext, useContext, ReactNode } from "react";
import { ClientSessionData } from "@omenai/shared-types";

interface SessionContextType {
  initialSessionData: ClientSessionData | null;
}

const SessionContext = createContext<SessionContextType>({
  initialSessionData: null,
});

interface SessionProviderProps {
  children: ReactNode;
  initialSessionData: ClientSessionData | null;
}

export function SessionProvider({
  children,
  initialSessionData,
}: SessionProviderProps) {
  return (
    <SessionContext.Provider value={{ initialSessionData }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  return useContext(SessionContext);
}
