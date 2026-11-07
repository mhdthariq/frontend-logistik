import { Button } from "@/components/ui/button";

export interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onRetry: () => unknown;
}

export function Pagination({ page, pages, total, loading, error, onPageChange, onRetry }: PaginationProps) {
  if (error) return <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-destructive">
    <p>{error}</p><Button variant="outline" onClick={() => onRetry()}>Coba lagi</Button>
  </div>;
  return <nav aria-label="Paginasi" className="flex flex-wrap items-center justify-between gap-3 text-sm">
    <p aria-live="polite">{loading ? "Memuat…" : `Halaman ${page} dari ${pages} · ${total} hasil`}</p>
    <div className="flex gap-2">
      <Button variant="outline" disabled={loading || page <= 1} onClick={() => onPageChange(page - 1)}>Sebelumnya</Button>
      <Button variant="outline" disabled={loading || page >= pages} onClick={() => onPageChange(page + 1)}>Berikutnya</Button>
    </div>
  </nav>;
}
