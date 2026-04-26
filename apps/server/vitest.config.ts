import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist", ".next", "__tests__/helpers/**"],
    setupFiles: ["__tests__/setup.ts"],
  },
});
