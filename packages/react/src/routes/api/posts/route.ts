import { jsonError, jsonResponse } from "@/lib/cms/http";
import { requireWorkspaceAccess } from "@/lib/cms/auth/guards";
import type { CmsAppOptions } from "@/index";
import {
  cmsApiErrorSchema,
  createPostBodySchema,
  listPostsResponseSchema,
  postResponseSchema,
} from "@/lib/cms/validation";

export async function GET(options: CmsAppOptions) {
  try {
    const { workspace } = await requireWorkspaceAccess(["admin", "editor", "viewer"], options);
    const posts = await options.storage.listWorkspacePosts(workspace.id);
    return jsonResponse(listPostsResponseSchema, { posts });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, options: CmsAppOptions) {
  try {
    const { session, workspace } = await requireWorkspaceAccess(["admin", "editor"], options);
    const rawBody = (await request.json().catch(() => null)) as unknown;
    const parsed = createPostBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return jsonResponse(
        cmsApiErrorSchema,
        { error: "Invalid request body", issues: parsed.error.flatten() },
        400,
      );
    }
    const payload = parsed.data;

    const { storage } = options;
    const existing = await storage.getPostBySlug(payload.slug, workspace.id);
    if (existing) {
      return jsonResponse(cmsApiErrorSchema, { error: "post slug already exists" }, 409);
    }

    const post = await storage.createPost(
      { userId: session.user.id, workspaceId: workspace.id },
      {
        slug: payload.slug,
        title: payload.title,
        description: payload.description ?? "",
        body: payload.body ?? "",
        status: payload.status ?? "draft",
      },
    );

    return jsonResponse(postResponseSchema, { post }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
