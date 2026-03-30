import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/server/collab/index.ts", "src/next/*", "src/providers/*"],
  target: "es2023",
  fixedExtension: false,
  dts: true,
  exports: {
    enabled: true,
    customExports: {
      "./styles/preset.css": "./styles/preset.css",
    },
  },
  unbundle: true,
});
