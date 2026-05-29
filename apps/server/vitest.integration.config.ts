import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/integration/**/*.integration.test.ts"],
    setupFiles: ["__tests__/integration/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 300000, // first run downloads the MongoDB binary (~600 MB); cached after that
  },
});
