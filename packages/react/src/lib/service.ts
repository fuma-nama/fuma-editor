import { CMS_DEFAULT_WORKSPACE_NAME, CMS_DEFAULT_WORKSPACE_SLUG } from "@/lib/cms/config";
import type { CmsStorage } from "@/lib/cms/storage/types";

export async function ensureDefaultWorkspace(storage: CmsStorage) {
  const existing = await storage.getWorkspaceBySlug(CMS_DEFAULT_WORKSPACE_SLUG);
  if (existing) return existing;
  return storage.createWorkspace({
    slug: CMS_DEFAULT_WORKSPACE_SLUG,
    name: CMS_DEFAULT_WORKSPACE_NAME,
  });
}
