import { loadEnvConfig } from "@next/env";

export function loadEnvInScript() {
  loadEnvConfig(process.cwd(), false);
}
