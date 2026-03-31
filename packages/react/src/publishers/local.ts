import { promises as fs } from "node:fs";
import path from "node:path";
import type { PublisherPlugin } from "@/lib/cms/publisher/types";

export interface LocalPublisherConfig {
  repoPath: string;
  postsDir?: string;
  extension?: "md" | "mdx";
}

function ensureRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Publisher payload must be a JSON object.");
  }
  return value as Record<string, unknown>;
}

function normalizeBody(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeFrontmatter(payload: Record<string, unknown>) {
  const frontmatter: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === "body") continue;
    frontmatter[key] = value;
  }
  return frontmatter;
}

function frontmatterToYaml(frontmatter: Record<string, unknown>) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(frontmatter)) {
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push("---");
  return `${lines.join("\n")}\n`;
}

export class LocalPublisherPlugin implements PublisherPlugin {
  readonly provider = "local-fs" as const;
  private readonly config: LocalPublisherConfig;

  constructor(config: LocalPublisherConfig) {
    this.config = config;
  }

  async publish(input: Parameters<PublisherPlugin["publish"]>[0]) {
    const payload = ensureRecord(input.delta.nextTargetPayload);
    const postsDir = this.config.postsDir ?? "content";
    const extension = this.config.extension ?? "mdx";
    const previous = (input.previousTargetSnapshot?.data ?? {}) as Record<string, unknown>;
    const slug = String(payload.slug ?? previous.slug ?? input.post.slug);
    const outputPath = path.join(this.config.repoPath, postsDir, `${slug}.${extension}`);

    if (input.post.deletedAt) {
      await fs.rm(outputPath, { force: true });
      return {
        outputRef: outputPath,
        outputPayload: payload,
      };
    }

    const frontmatter = normalizeFrontmatter(payload);
    const body = normalizeBody(payload.body);
    const fileContents = `${frontmatterToYaml(frontmatter)}\n${body}\n`;

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, fileContents, "utf8");

    return {
      outputRef: outputPath,
      outputPayload: payload,
    };
  }
}
