// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { apiGetWithMeta } from "../../src/infrastructure/http/client-api";
import { usePagedApi } from "../../src/hooks/use-paged-api";

vi.mock("../../src/infrastructure/http/client-api", () => ({ apiGetWithMeta: vi.fn() }));
const fetchPage = vi.mocked(apiGetWithMeta);
const response = (page = 1, id = page) => ({ data: [{ id }], meta: { page, pageSize: 25, pages: 3, total: 61, statuses: { CREATED: 61 }, unpriced: 61 } });

beforeEach(() => {
  vi.useFakeTimers();
  fetchPage.mockReset().mockResolvedValue(response());
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
const flush = () => act(async () => { await Promise.resolve(); });

it("requests one page, resets on filters, and debounces search including literal 'all'", async () => {
  const { result, rerender } = renderHook(({ search, status }) => usePagedApi<{ id: number }>("/shipments", { search, status }), { initialProps: { search: "", status: "all" } });
  await flush();
  expect(fetchPage.mock.calls[0][0]).toBe("/shipments?page=1&pageSize=25");
  fetchPage.mockResolvedValueOnce(response(2));
  act(() => result.current.pagination.onPageChange(2));
  await flush();
  expect(result.current.pagination.page).toBe(2);
  rerender({ search: "", status: "CREATED" });
  await flush();
  expect(fetchPage.mock.lastCall?.[0]).toBe("/shipments?status=CREATED&page=1&pageSize=25");
  rerender({ search: "", status: "all" });
  await flush();
  expect(fetchPage.mock.lastCall?.[0]).toBe("/shipments?page=1&pageSize=25");
  rerender({ search: "", status: "CREATED" });
  await flush();
  const calls = fetchPage.mock.calls.length;
  rerender({ search: "al", status: "CREATED" });
  rerender({ search: "all", status: "CREATED" });
  expect(result.current.data).toBeNull();
  await act(async () => { vi.advanceTimersByTime(299); });
  expect(fetchPage).toHaveBeenCalledTimes(calls);
  await act(async () => { vi.advanceTimersByTime(1); });
  expect(fetchPage.mock.lastCall?.[0]).toContain("search=all");
  expect(result.current.pagination.total).toBe(61);
});

it("aborts obsolete requests and ignores responses even if the transport ignores cancellation", async () => {
  let resolveOld!: (value: ReturnType<typeof response>) => void;
  fetchPage.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
  const { result, rerender, unmount } = renderHook(({ warehouseId }) => usePagedApi<{ id: number }>("/shipments", { warehouseId }), { initialProps: { warehouseId: 10 } });
  const oldSignal = fetchPage.mock.calls[0][1]!;
  rerender({ warehouseId: 11 });
  await flush();
  expect(oldSignal.aborted).toBe(true);
  await act(async () => { resolveOld(response(1, 999)); });
  expect(result.current.data).toEqual([{ id: 1 }]);
  const currentSignal = fetchPage.mock.lastCall?.[1]!;
  unmount();
  expect(currentSignal.aborted).toBe(true);
});

it("shows errors without stale actions, supports retry, and requires pagination metadata", async () => {
  const { result } = renderHook(() => usePagedApi<{ id: number }>("/invoices", {}));
  await flush();
  fetchPage.mockRejectedValueOnce(new Error("Offline"));
  await act(async () => { await result.current.reload(); });
  expect(result.current.pagination.error).toBe("Offline");
  expect(result.current.data).toBeNull();
  await act(async () => { await result.current.pagination.onRetry(); });
  expect(result.current.data).toEqual([{ id: 1 }]);
  fetchPage.mockResolvedValueOnce({ data: [{ id: 1 }], meta: undefined });
  await act(async () => { await result.current.reload(); });
  expect(result.current.pagination.error).toContain("Perbarui backend");
});

it("does not fetch hidden activity tabs and uses the server's clamped page", async () => {
  const { result, rerender } = renderHook(({ enabled }) => usePagedApi<{ id: number }>("/pickups", {}, enabled), { initialProps: { enabled: false } });
  await flush();
  expect(fetchPage).not.toHaveBeenCalled();
  rerender({ enabled: true });
  await flush();
  fetchPage.mockResolvedValueOnce(response(3));
  act(() => result.current.pagination.onPageChange(4));
  await flush();
  expect(result.current.pagination.page).toBe(3);
});
