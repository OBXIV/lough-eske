"use client";

import { createContext, useContext } from "react";

import type { UserSession } from "@/types/domain";

const SessionContext = createContext<UserSession | null>(null);

export function SessionProvider({ session, children }: { session: UserSession; children: React.ReactNode }) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useTenantSession() {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error("useTenantSession must be used inside SessionProvider.");
  }

  return session;
}
