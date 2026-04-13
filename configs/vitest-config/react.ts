import { defineConfig, mergeConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import baseConfig from "./base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      include: [
        "src/**/__tests__/**/*.{test,spec}.{ts,tsx}",
        "app/**/__tests__/**/*.{test,spec}.{ts,tsx}",
      ],
    },
  })
);
