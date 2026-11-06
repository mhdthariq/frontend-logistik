import { createServer as createHttpServer } from "node:http";
import { once } from "node:events";
import { createServer } from "vite";
import { expect, it } from "vitest";

it("serves deep links and forwards API requests, auth headers and JSON errors", async () => {
  const backend = createHttpServer((request, response) => {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      message: "Test session expired",
      path: request.url,
      method: request.method,
      token: request.headers.authorization,
      corporateId: request.headers["x-corp-id"],
    }));
  });
  backend.listen(0, "127.0.0.1");
  await once(backend, "listening");
  const address = backend.address();
  if (!address || typeof address === "string") throw new Error("Missing test backend port");
  const previousOrigin = process.env.GO_API_ORIGIN;
  process.env.GO_API_ORIGIN = `http://127.0.0.1:${address.port}`;
  const vite = await createServer({
    configFile: "vite.config.ts",
    // Do not replace the running dev server's optimized dependencies.
    cacheDir: "node_modules/.vite-proxy-test",
    server: { host: "127.0.0.1", port: 0, strictPort: false },
    logLevel: "silent",
  });
  try {
    await vite.listen();
    const frontend = vite.httpServer?.address();
    if (!frontend || typeof frontend === "string") throw new Error("Missing test frontend port");
    const origin = `http://127.0.0.1:${frontend.port}`;
    const page = await fetch(`${origin}/transports/9?tab=expenses`, { headers: { Accept: "text/html" } });
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("/src/main.tsx");
    const api = await fetch(`${origin}/api/v1/auth/me`, {
      headers: { Authorization: "Bearer test-token", "x-corp-id": "TEST" },
    });
    expect(api.status).toBe(401);
    expect(await api.json()).toEqual({
      message: "Test session expired", path: "/api/v1/auth/me", method: "GET",
      token: "Bearer test-token", corporateId: "TEST",
    });
  } finally {
    await vite.close();
    backend.closeAllConnections();
    await new Promise<void>((resolve, reject) => backend.close(error => error ? reject(error) : resolve()));
    if (previousOrigin === undefined) delete process.env.GO_API_ORIGIN;
    else process.env.GO_API_ORIGIN = previousOrigin;
  }
}, 20_000);
