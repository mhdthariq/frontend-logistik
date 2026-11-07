import { useEffect, useState } from "react";
import { apiGetWithMeta } from "@/infrastructure/http/client-api";
import { useApiData } from "@/hooks/use-api-data";

export interface PageMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
  statuses: Record<string, number>;
  unpriced: number;
}

export function usePagedApi<T>(path: string, filters: Record<string, string | number | boolean | null | undefined>, enabled = true) {
  const search = String(filters.search ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries({ ...filters, search: debouncedSearch })) {
    if (value != null && value !== "" && !(value === "all" && (name === "status" || name === "customerType"))) params.set(name, String(value));
  }
  const key = `${path}?${params}`;
  const [selection, setSelection] = useState({ key, page: 1 });
  if (selection.key !== key) setSelection({ key, page: 1 });
  const requestedPage = selection.key === key ? selection.page : 1;
  params.set("page", String(requestedPage));
  params.set("pageSize", "25");
  const result = useApiData(async (signal) => {
    if (!enabled) return null;
    const response = await apiGetWithMeta<T[]>(`${path}?${params}`, signal);
    if (!response.meta || !Number.isInteger(response.meta.page) || !Array.isArray(response.data)) {
      throw new Error("Backend belum mendukung pagination. Perbarui backend terlebih dahulu.");
    }
    return { data: response.data, meta: response.meta as unknown as PageMeta };
  }, [key, requestedPage, enabled]);
  // Never leave actions for the previous filter/page visible during a request or error.
  const current = result.loading || result.error || search !== debouncedSearch ? null : result.data;
  return {
    query: key,
    data: current?.data ?? null,
    meta: current?.meta,
    loading: result.loading || search !== debouncedSearch,
    reload: result.reload,
    pagination: {
      page: current?.meta.page ?? requestedPage,
      pages: current?.meta.pages ?? 1,
      total: current?.meta.total ?? 0,
      loading: result.loading || search !== debouncedSearch,
      error: result.error,
      onPageChange: (page: number) => setSelection({ key, page }),
      onRetry: result.reload,
    },
  };
}
