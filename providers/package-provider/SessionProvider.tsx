"use client";
import { UserType } from "@omenai/shared-types/index";
import React, { createContext, useContext, useEffect, useState } from "react";

type Session = UserType | undefined;

export const SessionContext = createContext<{
  session: Session;
  // updateSession: React.Dispatch<React.SetStateAction<Session>>;
}>({
  session: undefined,
  // updateSession: () => {},
});

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: UserType | undefined;
}) {
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const { session } = useContext(SessionContext);
  return session;
};
