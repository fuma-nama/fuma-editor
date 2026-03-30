import type { CmsAuthProvider } from "@/lib/cms/auth/types";
import type { CmsStorage } from "@/lib/cms/storage/types";
export type { CmsAuthProvider } from "@/lib/cms/auth/types";
export type { CmsStorage } from "@/lib/cms/storage/types";
export { BetterAuthProvider } from "@/providers/better-auth";
export type { BetterAuthLike } from "@/providers/better-auth";
export { KyselyPostgresStorageAdapter } from "@/lib/cms/storage/kysely-pg-adapter";

export interface CmsAppOptions {
  authProvider: CmsAuthProvider;
  storage: CmsStorage;
  /** When set, CMS server pages redirect here instead of throwing if the user has no session. API routes still return 401. */
  signInUrl?: string;
}
