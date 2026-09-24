import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    settings: {
      next: { rootDir: "apps/web" },
    },
  },
  {
    // DV-070 AC1: colour literals live in apps/web/src/styles/tokens.{css,ts} only.
    files: ["apps/web/**/*.{ts,tsx}"],
    ignores: ["apps/web/src/styles/tokens.ts", "apps/web/src/styles/tokens.test.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...["Literal[value", "TemplateElement[value.raw"].flatMap((node) => [
          {
            selector: `${node}=/(^|[\\s,(:])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b/]`,
            message:
              "Hex colour outside the token file. Use a token from @/styles/tokens.",
          },
          {
            selector: `${node}=/\\b(rgba?|hsla?|oklch|oklab)\\(/]`,
            message:
              "Colour function outside the token file. Use a token from @/styles/tokens.",
          },
        ]),
      ],
    },
  },
  globalIgnores([
    "**/.next/**",
    "**/coverage/**",
    "**/playwright-report/**",
    "**/test-results/**",
    "packages/contracts/generated/**",
  ]),
]);
