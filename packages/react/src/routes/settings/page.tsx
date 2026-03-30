import { requireWorkspaceAccess } from "@/lib/cms/auth/guards";
import type { CmsAppOptions } from "@/index";
import { SettingsView } from "./settings-view";
import { routerAuthErrorHandler } from "@/lib/auth/guards/router";

export default async function CmsSettingsPage(options: CmsAppOptions) {
  const { workspace } = await requireWorkspaceAccess(
    ["admin", "editor", "viewer"],
    options,
    routerAuthErrorHandler(options),
  );
  const { storage } = options;
  const targets = await storage.listPublishTargets(workspace.id);

  return (
    <SettingsView
      initialTargets={targets.map((target) => ({
        id: target.id,
        name: target.name,
        provider: target.provider,
        active: target.active,
        config: target.config,
      }))}
    />
  );
}
