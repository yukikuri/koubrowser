import { defineConfig } from "orval";

export default defineConfig({
  kcIntake: {
    input: "./openapi/kc-intake.yaml",
    output: {
      mode: "single",
      target: "./src/main/orval/generated/kc-intake.ts",
      client: "fetch",
      clean: true,
      override: {
        mutator: {
          path: "./src/main/orval/mutators/kc-intake.ts",
          name: "fetchWithBaseUrl",
        },
      },
    },
  },
});
