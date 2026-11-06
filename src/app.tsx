import { Component, lazy, Suspense, useEffect, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router";
import Home from "@/components/app/home";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/app/theme-provider";
import { PwaProvider } from "@/components/app/pwa";
import { Toaster } from "@/components/ui/sonner";

const TrackingPage = lazy(() => import("@/components/app/pages/tracking-page"));

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6" role="alert">
        <p>Halaman gagal dimuat. Silakan coba lagi.</p>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={() => window.location.reload()}>Muat ulang</button>
      </main>
    );
    return this.props.children;
  }
}

export function AppRoutes() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  // Preserve existing bookmarks and hash-based actions inside the migrated screens.
  useEffect(() => {
    if (hash.startsWith("#/")) navigate(hash.slice(1), { replace: true });
  }, [hash, navigate]);
  return (
    <Suspense fallback={<p className="p-6 text-center" role="status">Memuat halaman…</p>}>
      <Routes>
        <Route path="/tracking-paket" element={<TrackingPage />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" enableSystem>
          <PwaProvider>
            <AuthProvider><AppRoutes /><Toaster richColors position="top-right" closeButton /></AuthProvider>
          </PwaProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
