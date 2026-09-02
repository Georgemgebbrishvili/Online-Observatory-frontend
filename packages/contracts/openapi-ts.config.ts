import { defineConfig } from "@hey-api/openapi-ts";

// The spec is a pinned copy of the platform repository's contracts/openapi.yaml.
// Update it only by copying a released version across; never hand-edit it here.
export default defineConfig({
  input: "./openapi.yaml",
  output: {
    path: process.env.DARKVIEW_CONTRACTS_OUT ?? "generated",
    postProcess: [],
  },
  plugins: [
    { name: "@hey-api/typescript", enums: "javascript" },
    { name: "zod", exportFromIndex: true },
  ],
});
