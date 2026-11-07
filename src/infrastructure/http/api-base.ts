const origin = import.meta.env.VITE_API_ORIGIN?.trim() || "";

if (origin) {
  const url = new URL(origin);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("VITE_API_ORIGIN must be an HTTP(S) origin without credentials, a path, query or fragment.");
  }
}

export const API_BASE_URL = `${origin.replace(/\/$/, "")}/api/v1`;
