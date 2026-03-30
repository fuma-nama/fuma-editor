import { jsonError, jsonResponse } from "@/lib/cms/http";
import { requireWorkspaceAccess } from "@/lib/cms/auth/guards";
import type { CmsAppOptions } from "@/index";
import {
  cmsApiErrorSchema,
  createTargetBodySchema,
  listTargetsResponseSchema,
  targetResponseSchema,
} from "@/lib/cms/validation";

export async function GET(options: CmsAppOptions) {
  try {
    const { workspace } = await requireWorkspaceAccess(["admin", "editor", "viewer"], options);
    const targets = await options.storage.listPublishTargets(workspace.id);
    return jsonResponse(listTargetsResponseSchema, { targets });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, options: CmsAppOptions) {
  try {
    const { workspace } = await requireWorkspaceAccess(["admin"], options);
    const rawBody = (await request.json().catch(() => null)) as unknown;
    const parsed = createTargetBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return jsonResponse(
        cmsApiErrorSchema,
        { error: "Invalid request body", issues: parsed.error.flatten() },
        400,
      );
    }
    const payload = parsed.data;

    const target = await options.storage.createPublishTarget({
      workspaceId: workspace.id,
      provider: payload.provider,
      name: payload.name,
      config: payload.config ?? {},
      active: payload.active ?? true,
    });

    return jsonResponse(targetResponseSchema, { target }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
