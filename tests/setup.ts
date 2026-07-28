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
