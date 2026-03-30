import { z } from "zod";
import { CmsAuthError } from "@/lib/cms/auth/types";

export function jsonResponse<TSchema extends z.ZodTypeAny>(
  _schema: TSchema,
  data: z.input<TSchema>,
  status = 200,
) {
  return Response.json(data, { status });
}

export function jsonError(error: unknown) {
  if (error instanceof CmsAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof Error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ error: "Unknown error" }, { status: 500 });
}
