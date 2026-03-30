import { requireWorkspaceAccess } from "@/lib/cms/auth/guards";
import type { CmsAppOptions } from "@/index";
import { buildTrashEntries } from "@/lib/cms/trash";
import { Dashboard } from "./dashboard";
import { routerAuthErrorHandler } from "@/lib/auth/guards/router";

export default async function CmsDashboardPage(options: CmsAppOptions) {
  const { workspace } = await requireWorkspaceAccess(
    ["admin", "editor", "viewer"],
    options,
    routerAuthErrorHandler(options),
  );
  const { storage } = options;
  const [targets, deletedPosts] = await Promise.all([
    storage.listPublishTargets(workspace.id),
    storage.listDeletedWorkspacePosts(workspace.id),
  ]);
  const activeTargets = targets.filter((target) => target.active);
  const trashEntries = await buildTrashEntries({
    storage,
    deletedPosts,
    activeTargets,
  });

  return (
    <Dashboard
      initialTargets={targets.map((target) => ({
        id: target.id,
        name: target.name,
        provider: target.provider,
      }))}
      initialTrash={trashEntries.map((entry) => ({
        post: {
          id: entry.post.id,
          slug: entry.post.slug,
          title: entry.post.title,
          status: entry.post.status,
          version: entry.post.version,
        },
        totalTargets: entry.totalTargets,
        syncedTargets: entry.syncedTargets,
        unsyncedTargets: entry.unsyncedTargets,
      }))}
    />
  );
}
