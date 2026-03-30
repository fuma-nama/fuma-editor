import { AuthContext, CmsAuthError, CmsAuthProvider, CmsSession } from "@/lib/cms/auth/types";
import type { CmsAppOptions } from "@/index";
import { ensureDefaultWorkspace } from "@/lib/cms/service";
import type { CmsRole } from "../schema/domain-schema";

/** handle redirects etc when failed to match permission requriement */
export interface AuthErrorHandler {
  redirectUnauthenticated: () => never;
}

export async function requireWorkspaceAccess(
  allowedRoles: Array<"admin" | "editor" | "viewer">,
  options: CmsAppOptions,
  handler?: AuthErrorHandler,
) {
  const provider = options.authProvider;
  const storage = options.storage;
  const session = await requireSession(provider, handler);
  const workspace = await ensureDefaultWorkspace(storage);

  await assertRole(provider, session, { workspaceId: workspace.id }, allowedRoles);

  return { provider, session, workspace };
}

export async function requireSession(
  provider: CmsAuthProvider,
  handler?: AuthErrorHandler,
): Promise<CmsSession> {
  const session = await provider.getSession();
  if (!session) {
    handler?.redirectUnauthenticated?.();
    throw new CmsAuthError("Authentication required", 401);
  }
  return session;
}

export async function assertRole(
  provider: CmsAuthProvider,
  session: CmsSession,
  context: AuthContext,
  allowedRoles: CmsRole[],
) {
  const roles = await provider.getUserRoles(session.user.id, context);
  const allowed = roles.some((role) => allowedRoles.includes(role));
  if (!allowed) {
    throw new CmsAuthError("Insufficient permissions", 403);
  }
  return roles;
}

export async function canPublish(
  provider: CmsAuthProvider,
  session: CmsSession,
  context: AuthContext,
) {
  const roles = await provider.getUserRoles(session.user.id, context);
  return roles.includes("admin") || roles.includes("editor");
}

export async function canEdit(
  provider: CmsAuthProvider,
  session: CmsSession,
  context: AuthContext,
) {
  const roles = await provider.getUserRoles(session.user.id, context);
  return roles.includes("admin") || roles.includes("editor");
}
