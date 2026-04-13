import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@omenai/vitest-config/base";

export default mergeConfig(baseConfig, defineConfig({}));
