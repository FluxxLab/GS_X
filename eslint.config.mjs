import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Tracked as a warning rather than an error: ~240 existing `any`s exist
      // and mass-retyping them is a separate, deliberate effort. New `any`
      // still shows up in lint output; the quality bar treats them as debt to
      // pay down, not a merge blocker. (Engineering Guidelines: lint gate.)
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused vars surface as warnings (noise from work-in-progress), not
      // build blockers; remove them as you touch files.
      "@typescript-eslint/no-unused-vars": "warn",
      // React Compiler readiness rules (eslint-plugin-react-hooks v6): advisory
      // perf/compiler-adoption checks, not correctness bugs. Tracked as warnings
      // during incremental adoption and fixed per-file as components are touched.
      // The correctness rule (rules-of-hooks) stays an ERROR by default.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
]);

export default eslintConfig;
