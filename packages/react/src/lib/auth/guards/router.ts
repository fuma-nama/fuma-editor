import { redirect } from "next/navigation";
import type { CmsAppOptions } from "@/index";
import type { AuthErrorHandler } from "@/lib/cms/auth/guards";

export function routerAuthErrorHandler(options: CmsAppOptions): AuthErrorHandler | undefined {
  const signInUrl = options.signInUrl;
  if (!signInUrl) return undefined;
  return {
    redirectUnauthenticated: () => redirect(signInUrl),
  };
}
