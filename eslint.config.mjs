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
    ignores: [
      "apps/web/src/styles/tokens.ts",
      "apps/web/src/styles/tokens.test.ts",
      // ADR-053: the observatory console and its sky model draw on a canvas and in SVG
      // with the Skychaser source's own values, kept as written.
      "apps/web/src/components/observatory-console/**",
      "apps/web/src/lib/observatory-sim/**",
    ],
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
  {
    // ADR-053: the observatory console drives a mount and a canvas from refs and timers,
    // as its source wrote it; the React Compiler's rules read that as render-time work.
    files: ["apps/web/src/components/observatory-console/**"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/use-memo": "off",
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
