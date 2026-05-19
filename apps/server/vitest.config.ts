import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist", ".next", "__tests__/helpers/**", "__tests__/integration/**"],
    setupFiles: ["__tests__/setup.ts"],
    env: {
      DEEPLINK_SECRET:
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    },
  },
});
