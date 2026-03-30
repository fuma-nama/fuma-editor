import { notFound } from "next/navigation";
import { requireWorkspaceAccess } from "@/lib/cms/auth/guards";
import type { CmsAppOptions } from "@/index";
import { Editor } from "./editor";
import { EditorPageHeader } from "./editor-page-header";
import { routerAuthErrorHandler } from "@/lib/auth/guards/router";

export default async function CmsPostEditorPage(
  {
    params,
  }: {
    params: Promise<{ postId: string }>;
  },
  options: CmsAppOptions,
) {
  const [{ workspace }, { postId }] = await Promise.all([
    requireWorkspaceAccess(["admin", "editor", "viewer"], options, routerAuthErrorHandler(options)),
    params,
  ]);

  const { storage } = options;
  const [post, targets] = await Promise.all([
    storage.getPostById(postId, workspace.id),
    storage.listPublishTargets(workspace.id),
  ]);

  if (!post) notFound();

  return (
    <>
      <EditorPageHeader title={post.title} slug={post.slug} />

      <Editor
        postId={post.id}
        targets={targets.map((target) => ({
          id: target.id,
          name: target.name,
          provider: target.provider,
        }))}
        initial={{
          slug: post.slug,
          title: post.title,
          description: post.description,
          body: post.body,
          status: post.status,
        }}
      />
    </>
  );
}
