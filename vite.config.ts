/// <reference types="vitest" />
import angular from "@analogjs/vite-plugin-angular";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  test: {
    include: ["./src/**/*.{test,spec}.ts"],
    setupFiles: ["./tests/setup/setup-test-env.ts"],
    restoreMocks: true,
    coverage: {
      include: ["src/**/*.ts"],
      all: true,
    },
    reporters: ["default"],
    environment: "jsdom",
    globals: true,
  },
  define: {
    "import.meta.vitest": mode !== "production",
  },
}));
