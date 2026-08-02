/**
 * Vitest setup, run once before every test file.
 *
 * Two things happen here, and both exist to stop one test's state reaching
 * another: the rendered tree is unmounted, and both web storages are cleared.
 * A remembered guest order leaking between tests would make an ownership
 * assertion pass for the wrong reason, which is worse than failing.
 */

import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Storage is per-test. Leaking a remembered guest order between tests would
// make ownership assertions pass for the wrong reason.
beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});
