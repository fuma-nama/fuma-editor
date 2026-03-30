import "dotenv/config";
import { defineConfig } from "prisma/config";
import { loadEnvInScript } from "./lib/env";

loadEnvInScript();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
