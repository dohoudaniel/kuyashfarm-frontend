import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],

    /**
     * 15s, not the 5s default.
     *
     * Nothing here is testing latency — these are behavioural tests that
     * render a component, click something and assert on the result. The
     * default exists to catch a hung promise, and 15s catches that just as
     * well.
     *
     * It was raised because the suite became intermittently flaky at around
     * 187 tests: vitest runs files in parallel, and under that load a render
     * that normally takes 300ms occasionally exceeded 5s on a loaded machine.
     * The failures were timeouts rather than assertions — always a different
     * file, never reproducible in isolation — which is the signature of
     * contention rather than of a bug. Reproduced roughly one run in four
     * before this, zero after.
     *
     * If a test genuinely takes 15s, that is a real problem and this will
     * still surface it.
     */
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
