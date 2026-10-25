/**
 * Sanity CLI configuration (schema extract, typegen, deploy, dataset commands).
 * Loads .env.local the same way Next.js does, so one set of variables serves both.
 */
import { loadEnvConfig } from "@next/env";
import { defineCliConfig } from "sanity/cli";

loadEnvConfig(process.cwd());

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "unconfigured",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
  typegen: {
    path: "./{app,components,features,lib,sanity}/**/*.{ts,tsx}",
    schema: "./sanity/extract.json",
    generates: "./sanity/sanity.types.ts",
  },
});
