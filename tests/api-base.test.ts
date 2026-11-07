import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules(); });

it.each([
  ["", "/api/v1"],
  [" https://api.example.com/ ", "https://api.example.com/api/v1"],
  ["http://127.0.0.1:8085", "http://127.0.0.1:8085/api/v1"],
])("uses the configured backend %s for normal and paginated requests", async (origin, base) => {
  vi.stubEnv("VITE_API_ORIGIN", origin);
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: [], meta: { total: 0 } }) });
  vi.stubGlobal("fetch", fetchMock);
  const { apiGet, apiGetWithMeta } = await import("@/infrastructure/http/client-api");
  await apiGet("/shipments");
  await apiGetWithMeta("/shipments?page=2");
  expect(fetchMock.mock.calls.map(call => call[0])).toEqual([`${base}/shipments`, `${base}/shipments?page=2`]);
});

it.each(["ftp://api.example.com", "https://user:pass@api.example.com", "https://api.example.com/api", "https://api.example.com/?secret=value", "https://api.example.com/#fragment", "invalid"])("rejects invalid backend origins: %s", async origin => {
  vi.stubEnv("VITE_API_ORIGIN", origin);
  await expect(import("@/infrastructure/http/api-base")).rejects.toThrow();
});
