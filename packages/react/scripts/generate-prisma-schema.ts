import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_OUTPUT = "prisma/schema.prisma";
const DEFAULT_SOURCE = "src/lib/schema/domain-schema.ts";

function resolveOutputPath(): string {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--out");
  const cliOut = outIndex >= 0 ? args[outIndex + 1] : undefined;
  const envOut = process.env.PRISMA_SCHEMA_OUTPUT;
  const output = cliOut ?? envOut ?? DEFAULT_OUTPUT;
  return path.resolve(process.cwd(), output);
}

function resolveSourcePath(): string {
  const args = process.argv.slice(2);
  const srcIndex = args.indexOf("--source");
  const cliSource = srcIndex >= 0 ? args[srcIndex + 1] : undefined;
  const envSource = process.env.PRISMA_SCHEMA_SOURCE;
  const source = cliSource ?? envSource ?? DEFAULT_SOURCE;
  return path.resolve(process.cwd(), source);
}

function toPascalCase(value: string): string {
  return value
    .replace(/^[a-z]/, (char) => char.toUpperCase())
    .replace(/[_-]([a-z])/g, (_, char: string) => char.toUpperCase());
}

function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase();
}

type MapFieldContext = {
  modelName: string;
  fieldName: string;
  syntheticEnums: Map<string, string[]>;
};

const PRIMITIVE_MAP: Record<string, string> = {
  string: "String",
  number: "Int",
  boolean: "Boolean",
  Date: "DateTime",
  unknown: "Json",
  Uint8Array: "Bytes",
};

function mapTsTypeToPrisma(typeText: string, context: MapFieldContext): string {
  let type = typeText.trim();
  let optional = false;

  if (type.includes("| null")) {
    optional = true;
    type = type.replace(/\s*\|\s*null/g, "").trim();
  }

  let isArray = false;
  if (type.endsWith("[]")) {
    isArray = true;
    type = type.slice(0, -2).trim();
  }

  const literalUnionMatch = type.match(/^"[^"]+"(?:\s*\|\s*"[^"]+")+$/);
  if (literalUnionMatch) {
    const enumName = `${context.modelName}${toPascalCase(context.fieldName)}`;
    const values = [...type.matchAll(/"([^"]+)"/g)]
      .map((item) => item[1])
      .filter((v): v is string => v !== undefined);
    context.syntheticEnums.set(enumName, values);
    const suffix = `${isArray ? "[]" : ""}${optional ? "?" : ""}`;
    return `${enumName}${suffix}`;
  }

  const mapped = PRIMITIVE_MAP[type] ?? type;

  const suffix = `${isArray ? "[]" : ""}${optional ? "?" : ""}`;
  return `${mapped}${suffix}`;
}

type ParsedEnum = { name: string; values: string[] };

function parseEnums(source: string): ParsedEnum[] {
  const enumRegex = /export const (\w+)Values = \[([^\]]+)\] as const;/g;
  const enums: ParsedEnum[] = [];

  let match: RegExpExecArray | null;
  while ((match = enumRegex.exec(source)) !== null) {
    const rawName = match[1];
    const rawValues = match[2];
    if (!rawName || rawValues === undefined) continue;
    const enumName = toPascalCase(rawName.replace(/Values$/, ""));
    const values = [...rawValues.matchAll(/"([^"]+)"/g)]
      .map((item) => item[1])
      .filter((v): v is string => v !== undefined);
    enums.push({ name: enumName, values });
  }

  return enums;
}

function parseModels(source: string): { models: string[]; syntheticEnums: Map<string, string[]> } {
  const modelRegex = /export interface (\w+Entity)\s*\{([\s\S]*?)\n\}/g;
  const fieldRegex = /^\s*(\w+):\s*([^;]+);$/gm;
  const models: string[] = [];
  const syntheticEnums = new Map<string, string[]>();

  let modelMatch: RegExpExecArray | null;
  while ((modelMatch = modelRegex.exec(source)) !== null) {
    const entityName = modelMatch[1];
    const body = modelMatch[2];
    if (!entityName || body === undefined) continue;
    const modelName = entityName.replace(/Entity$/, "");
    const tableName = toSnakeCase(modelName.replace(/^Cms/, "cms_"));
    const fields: string[] = [];

    let fieldMatch: RegExpExecArray | null;
    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];
      if (!fieldName || fieldType === undefined) continue;
      const prismaType = mapTsTypeToPrisma(fieldType, {
        modelName,
        fieldName,
        syntheticEnums,
      });
      const idMark = fieldName === "id" ? " @id" : "";
      fields.push(`  ${fieldName} ${prismaType}${idMark}`);
    }

    const lines = [`model ${modelName} {`, ...fields];

    if (!fields.some((line) => line.includes(" @id")) && modelName === "CmsWorkspaceMember") {
      lines.push("");
      lines.push("  @@id([workspaceId, userId])");
    }

    lines.push(`  @@map("${tableName}")`);
    lines.push("}");
    models.push(lines.join("\n"));
  }

  return { models, syntheticEnums };
}

async function generateSchema(): Promise<string> {
  const sourcePath = resolveSourcePath();
  const source = await readFile(sourcePath, "utf8");
  const enums = parseEnums(source);
  const { models, syntheticEnums } = parseModels(source);
  const derivedEnums = [...syntheticEnums.entries()].map(([name, values]) => ({ name, values }));

  const blocks = [
    "// Generated by packages/react/scripts/generate-prisma-schema.ts (bun run prisma:schema:generate)",
    `// Source of truth: ${DEFAULT_SOURCE}`,
    "",
    "generator client {",
    '  provider = "prisma-client"',
    '  output   = "../generated/prisma"',
    "}",
    "",
    "datasource db {",
    '  provider = "postgresql"',
    "}",
    "",
    ...enums.flatMap((item) => [
      `enum ${item.name} {`,
      ...item.values.map((value) => `  ${value}`),
      "}",
      "",
    ]),
    ...derivedEnums.flatMap((item) => [
      `enum ${item.name} {`,
      ...item.values.map((value) => `  ${value}`),
      "}",
      "",
    ]),
    ...models.flatMap((model) => [model, ""]),
  ];

  return `${blocks.join("\n").trimEnd()}\n`;
}

const outputPath = resolveOutputPath();
const schema = await generateSchema();
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, schema, "utf8");
console.log(`Generated Prisma schema at ${outputPath}`);
