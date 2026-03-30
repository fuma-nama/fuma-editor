import { jsonError, jsonResponse } from "@/lib/cms/http";
import { requireWorkspaceAccess } from "@/lib/cms/auth/guards";
import type { CmsAppOptions } from "@/index";
import { buildTrashEntries } from "@/lib/cms/trash";
import {
  cmsApiErrorSchema,
  deletePostApiResponseSchema,
  postResponseSchema,
  updatePostBodySchema,
} from "@/lib/cms/validation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
  options: CmsAppOptions,
) {
  try {
    const [{ workspace }, { postId }] = await Promise.all([
      requireWorkspaceAccess(["admin", "editor", "viewer"], options),
      context.params,
    ]);
    const post = await options.storage.getPostById(postId, workspace.id);
    if (!post) return jsonResponse(cmsApiErrorSchema, { error: "not found" }, 404);
    return jsonResponse(postResponseSchema, { post });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ postId: string }> },
  options: CmsAppOptions,
) {
  try {
    const [{ session, workspace }, { postId }] = await Promise.all([
      requireWorkspaceAccess(["admin", "editor"], options),
      context.params,
    ]);
    const rawBody = (await request.json().catch(() => null)) as unknown;
    const parsed = updatePostBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return jsonResponse(
        cmsApiErrorSchema,
        { error: "Invalid request body", issues: parsed.error.flatten() },
        400,
      );
    }
    const payload = parsed.data;

    const post = await options.storage.updatePost(
      { userId: session.user.id, workspaceId: workspace.id },
      postId,
      {
        slug: payload.slug,
        title: payload.title,
        description: payload.description,
        body: payload.body,
        status: payload.status,
        publishedAt:
          payload.publishedAt === undefined
            ? undefined
            : payload.publishedAt
              ? new Date(payload.publishedAt)
              : null,
      },
    );

    if (!post) return jsonResponse(cmsApiErrorSchema, { error: "not found" }, 404);
    return jsonResponse(postResponseSchema, { post });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
  options: CmsAppOptions,
) {
  try {
    const [{ session, workspace }, { postId }] = await Promise.all([
      requireWorkspaceAccess(["admin", "editor"], options),
      context.params,
    ]);
    const { storage } = options;
    const post = await storage.deletePost(
      { userId: session.user.id, workspaceId: workspace.id },
      postId,
    );
    if (!post) return jsonResponse(cmsApiErrorSchema, { error: "not found" }, 404);

    const activeTargets = (await storage.listPublishTargets(workspace.id)).filter(
      (target) => target.active,
    );
    const [entry] = await buildTrashEntries({
      storage,
      deletedPosts: [post],
      activeTargets,
    });

    return jsonResponse(deletePostApiResponseSchema, { post, trashEntry: entry });
  } catch (error) {
    return jsonError(error);
  }
}
