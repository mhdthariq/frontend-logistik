# NovaLogistik frontend

React + TypeScript + Vite client for the Go API in `../backend`. This app has no
Next.js runtime, API handlers, database connection or server credentials.
The original `../kirimku` is retained as the migration reference.

## Development

Requires Node.js 22.12+ (or 24+) and Bun.

```powershell
cd frontend
bun install --frozen-lockfile
Copy-Item .env.example .env
bun run dev
```

Open http://localhost:3000. Vite proxies `/api` to the deployed Go backend,
`https://backend-logistik-gamma.vercel.app`, in development and local preview.
Corporate ID login is enabled for this backend. To use a local backend, set
`GO_API_ORIGIN=http://127.0.0.1:8080` and `VITE_RUNTIME_MODE=development` in
`.env.local`, then follow [the backend README](../backend/README.md).
Existing bearer tokens and Corporate ID headers continue to work.

```powershell
bun run typecheck
bun run test
bun run build
bun run preview
```

Development and normal builds show the production login. `bun run build:preview` shows the
preview login with the trial Corporate ID. Set `VITE_RUNTIME_MODE` only to
override these defaults. Match the Go backend: development uses its default
mode, production uses `NODE_ENV=production`, and preview also sets
`PREVIEW_MODE=true`. Vite environment values are fixed at build time.

Only public settings belong in `VITE_*`. Database and licensing credentials
stay exclusively in the backend environment. `GO_API_ORIGIN` configures only
the Vite development/preview proxy.

## Deployment

To choose the backend for browser requests, set this in `frontend/.env` before
building (use your backend's HTTPS domain, without `/api`):

```dotenv
VITE_API_ORIGIN=https://api.your-domain.com
```

Rebuild and redeploy the frontend after changing it. This public value is compiled
into `dist/`; uploading an `.env` beside an existing build does not change it.
When the API uses a different origin, set `CORS_ALLOW_ORIGINS` in the backend's
process environment to a comma-separated list of frontend origins, for example
`http://localhost:3000,https://app.your-domain.com`, then restart the backend.
The Go backend handles OPTIONS requests and permits Authorization, Content-Type,
and x-corp-id headers for those origins.
Leave `VITE_API_ORIGIN` empty to keep same-origin `/api` requests and the reverse
proxy configurations below. No backend credentials belong in the frontend `.env`.

For Vercel, select `frontend/` as the project root. The included `vercel.json`
forwards `/api` to the deployed backend and serves the SPA for frontend routes.
Changing `GO_API_ORIGIN` affects Vite development/preview only; update the
Vercel rewrite destinations when changing the production backend.

`bun run build` produces the static `dist/` directory. Serve it with a static
web server, forward `/api` requests to the Go backend, and fall back to
`index.html` for frontend routes. API errors must remain backend responses.
`vite preview` is for local build checks, not production hosting
([Vite deployment guide](https://vite.dev/guide/static-deploy)).

Example Nginx server configuration (set `root` to the deployed `dist/` path):

```nginx
root /srv/novalogistik/frontend/dist;
index index.html;

location = /api {
    proxy_pass http://127.0.0.1:8080;
}
location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
location = /sw.js {
    add_header Cache-Control "no-cache";
}
location / {
    try_files $uri $uri/ /index.html;
}
```

HTTPS is required outside localhost for camera/geolocation and PWA support.
The service worker is registered only for built apps; API data is never cached.
Navigation uses browser paths; old `/#/...` bookmarks and existing hash actions
are redirected to those paths, including detail IDs and query parameters.
Public tracking remains at `/tracking-paket`.
