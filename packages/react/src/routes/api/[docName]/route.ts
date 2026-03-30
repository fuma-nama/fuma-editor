import { jsonError, jsonResponse } from "@/lib/cms/http";
import { requireWorkspaceAccess } from "@/lib/cms/auth/guards";
import type { CmsAppOptions } from "@/index";
import { realtimeDocResponseSchema } from "@/lib/cms/validation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ docName: string }> },
  options: CmsAppOptions,
) {
  try {
    await requireWorkspaceAccess(["admin", "editor", "viewer"], options);
    const { docName } = await context.params;
    const doc = await options.storage.getRealtimeDoc(docName);
    if (!doc) return jsonResponse(realtimeDocResponseSchema, { doc: null });
    return jsonResponse(realtimeDocResponseSchema, {
      doc: { ...doc, state: Buffer.from(doc.state).toString("base64") },
    });
  } catch (error) {
    return jsonError(error);
  }
}
