// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Pagination } from "../../src/components/app/pagination";

afterEach(cleanup);
it("exposes accessible controls and disables unavailable or loading pages", () => {
  const change = vi.fn();
  const props = { page: 1, pages: 3, total: 61, loading: false, error: null, onPageChange: change, onRetry: vi.fn() };
  const { rerender } = render(<Pagination {...props} />);
  expect(screen.getByRole("navigation", { name: "Paginasi" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
  expect(change).toHaveBeenCalledWith(2);
  rerender(<Pagination {...props} page={3} />);
  expect(screen.getByRole("button", { name: "Berikutnya" })).toBeDisabled();
  rerender(<Pagination {...props} page={2} loading />);
  for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
});
it("shows a retry action instead of a misleading empty result on errors", () => {
  const retry = vi.fn();
  render(<Pagination page={1} pages={1} total={0} loading={false} error="Offline" onRetry={retry} onPageChange={vi.fn()} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Offline");
  fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
  expect(retry).toHaveBeenCalledOnce();
});
