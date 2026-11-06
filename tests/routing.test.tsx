// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppRoute } from "@/hooks/use-app-route";

vi.mock("@/components/app/home", () => ({ default: () => {
  const { segments, query } = useAppRoute();
  return <p>Screen: {segments.join("/")} tab={query.get("tab")}</p>;
} }));
vi.mock("@/components/app/pages/tracking-page", () => ({ default: () => <p>Public tracking</p> }));
import { AppRoutes } from "@/app";

function Location() {
  const { pathname, search, hash } = useLocation();
  return <output aria-label="URL">{pathname}{search}{hash}</output>;
}

beforeEach(() => window.history.replaceState(null, "", "/"));
function mount() { render(<BrowserRouter><AppRoutes /><Location /></BrowserRouter>); }

describe("Vite client routing", () => {
  it.each(["customers", "gudang", "tariffs", "pickups", "deliveries", "return-tasks", "shipments/12", "transports/9/manifest"])("opens /%s directly", async (path) => {
    window.history.replaceState(null, "", `/${path}`);
    mount();
    expect(await screen.findByText(`Screen: ${path} tab=`)).toBeInTheDocument();
  });
  it("converts legacy bookmarks and in-screen hash actions to browser paths", async () => {
    window.history.replaceState(null, "", "/#/transports/9?tab=expenses");
    mount();
    await waitFor(() => expect(screen.getByLabelText("URL")).toHaveTextContent("/transports/9?tab=expenses"));
    expect(screen.getByText("Screen: transports/9 tab=expenses")).toBeInTheDocument();
    window.history.pushState(null, "", "/transports/9?tab=expenses#/shipments/12?print=1");
    fireEvent(window, new PopStateEvent("popstate"));
    await waitFor(() => expect(screen.getByLabelText("URL")).toHaveTextContent("/shipments/12?print=1"));
  });
  it("keeps public tracking outside the authenticated shell", async () => {
    window.history.replaceState(null, "", "/tracking-paket?corporateId=TRIAL&resi=ABC");
    mount();
    expect(await screen.findByText("Public tracking")).toBeInTheDocument();
    expect(screen.queryByText(/Screen:/)).not.toBeInTheDocument();
  });
});
