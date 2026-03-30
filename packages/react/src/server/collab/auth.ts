import { verifyCollabToken } from "@/lib/cms/collab-token";
import type { CmsStorage } from "@/lib/cms/storage/types";

export async function authorizeCollabConnection(data: {
  token: string;
  workspaceId: string;
  requiredRoles: Array<"admin" | "editor" | "viewer">;
  storage: CmsStorage;
}) {
  const payload = verifyCollabToken(data.token);
  if (payload.workspaceId !== data.workspaceId) {
    throw new Error("Collab token workspace mismatch.");
  }

  const membership = await data.storage.getWorkspaceMember(payload.workspaceId, payload.userId);
  if (!membership) {
    throw new Error("User is not a workspace member.");
  }
  if (!data.requiredRoles.includes(membership.role)) {
    throw new Error("Insufficient role for collab access.");
  }

  return {
    userId: payload.userId,
    workspaceId: payload.workspaceId,
    role: membership.role,
  };
}
