"use client";

import { createContext, useContext, type ReactNode } from "react";

export type CmsMembershipRole = "admin" | "editor" | "viewer";

export interface CmsWorkspaceSummary {
  name: string;
  slug: string;
}

export interface CmsUserSummary {
  id: string;
  email: string | null;
}

export interface CmsSessionValue {
  workspace: CmsWorkspaceSummary;
  user: CmsUserSummary;
  membershipRole: CmsMembershipRole;
}

const CmsSessionContext = createContext<CmsSessionValue | null>(null);

export function CmsSessionProvider({
  value,
  children,
}: {
  value: CmsSessionValue;
  children: ReactNode;
}) {
  return <CmsSessionContext.Provider value={value}>{children}</CmsSessionContext.Provider>;
}

export function useCmsSession() {
  const ctx = useContext(CmsSessionContext);
  if (!ctx) {
    throw new Error("useCmsSession must be used within CmsSessionProvider");
  }
  return ctx;
}
