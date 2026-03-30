import type { CmsAppOptions } from "@fuma-editor/react";
import { BetterAuthProvider } from "@fuma-editor/react/providers/better-auth";
import { KyselyPostgresStorageAdapter } from "@fuma-editor/react";
import { auth } from "./auth";
import { pool } from "./db";

const storage = new KyselyPostgresStorageAdapter(pool);

export const cmsOptions: CmsAppOptions = {
  authProvider: new BetterAuthProvider(auth, storage),
  storage,
  signInUrl: "/login",
};
