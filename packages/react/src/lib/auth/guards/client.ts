import type { CmsRole } from "@/lib/cms/schema/domain-schema";

/** Admin or editor — matches server publish/post-mutation rules. */
export function canPublish(role: CmsRole): boolean {
  return role === "admin" || role === "editor";
}

/** Admin only — create or change publisher targets. */
export function canManagePublisherTargets(role: CmsRole): boolean {
  return role === "admin";
}
