import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "classic"
    }),
    tsconfigPaths()
  ],
  test: {
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    environment: "jsdom",
    alias: {},
    deps: {
      inline: ["next"]
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "vitest.config.ts",
        "vitest.config.mts",
        ".next/",
        "next.config.ts",
        "postcss.config.js",
        "tailwind.config.ts"
      ]
    },
    reporters: ["default"],
    maxConcurrency: 5,
    testTimeout: 10000,
    hookTimeout: 10000,
    css: false
  }
});
