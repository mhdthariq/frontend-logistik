import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it.each([
  [true, "development", undefined, "development", true, false],
  [false, "production", undefined, "production", false, true],
  [false, "preview", undefined, "preview", true, true],
  [true, "development", "production", "production", false, true],
] as const)("selects the login variant for DEV=%s MODE=%s override=%s", async (dev, mode, override, expected, demo, corporateId) => {
  vi.resetModules();
  vi.stubEnv("DEV", dev);
  vi.stubEnv("MODE", mode);
  vi.stubEnv("VITE_RUNTIME_MODE", override);
  const runtime = await import("@/shared/runtime-mode");
  expect(runtime.RUNTIME_MODE).toBe(expected);
  expect(runtime.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS).toBe(demo);
  expect(runtime.NEXT_PUBLIC_SHOW_CORP_ID).toBe(corporateId);
});

it("rejects invalid modes", async () => {
  vi.stubEnv("VITE_RUNTIME_MODE", "typo");
  await expect(import("@/shared/runtime-mode")).rejects.toThrow("VITE_RUNTIME_MODE");
});
