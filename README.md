# TanStack Start — Feature Tour 🏝️

A learning project: **every TanStack Start feature lives in its own route**, and every route file is written to be
_read_. Each file starts with a documentation block explaining the concept, the APIs involved and the common
mistakes, followed by a small working demo.

Open a page in the browser, play with the demo, then open the file shown at the top of that page.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # production build (+ prerenders 2 pages)
npm start            # serve the build on http://localhost:3000
npm run typecheck    # tsc --noEmit
```

Optional: copy `.env.example` to `.env` to see the environment-variable demo with values.

Demo logins for `/auth`: `admin@example.com / admin123` and `user@example.com / user123`.

## Read these first

| File | What it is |
| --- | --- |
| `vite.config.ts` | The `tanstackStart()` Vite plugin (+ RSC and prerender options) |
| `src/router.tsx` | `getRouter()` — creates the router and a per-request `QueryClient` |
| `src/routes/__root.tsx` | The HTML document shell (`<HeadContent />`, `<Outlet />`, `<Scripts />`) |
| `src/start.ts` | Global middleware (CSRF, request logger, server-function timing) |
| `src/server.ts` / `src/client.tsx` | Optional custom server / client entry points |

## Feature index

### 1. Routing basics
| Route | File | Feature |
| --- | --- | --- |
| `/routing` | `src/routes/routing*.tsx` | File-based routing, layouts, `<Outlet />`, pathless layouts, naming rules |
| `/path-params` | `src/routes/path-params/` | `$param`, splat `$`, optional `{-$param}`, `params.parse` |
| `/search-params` | `src/routes/search-params.tsx` | `validateSearch` with zod, typed URL state, `loaderDeps` |
| `/navigation` | `src/routes/navigation.tsx` | `<Link>`, `useNavigate`, `redirect()`, `<Navigate>`, `useBlocker`, preloading |
| `/route-context` | `src/routes/route-context*.tsx` | Router context, `beforeLoad`, context inheritance |
| `/head-seo` | `src/routes/head-seo.tsx` | `head()`: title, meta, Open Graph, canonical, JSON-LD |
| `/css-styling` | `src/routes/css-styling.tsx` | Global CSS via `?url`, CSS Modules, inline styles |

### 2. Data loading
| Route | File | Feature |
| --- | --- | --- |
| `/loaders` | `src/routes/loaders.tsx` | `loader`, `staleTime`, `pendingComponent`, `router.invalidate()` |
| `/deferred-data` | `src/routes/deferred-data.tsx` | Un-awaited loader promises streamed with `<Await>` / `use()` |
| `/tanstack-query` | `src/routes/tanstack-query.tsx` | SSR query prefetch, streaming, `useSuspenseQuery`, mutations |
| `/error-handling` | `src/routes/error-handling.tsx` | `errorComponent`, `notFound()`, `notFoundComponent`, `reset()` |

### 3. Server
| Route | File | Feature |
| --- | --- | --- |
| `/server-functions` | `src/routes/server-functions.tsx` | `createServerFn`, GET vs POST, validation, `useServerFn` |
| `/forms` | `src/routes/forms.tsx` | `FormData` (and file uploads) into server functions |
| `/streaming` | `src/routes/streaming.tsx` | Async generators and `ReadableStream` from server functions |
| `/middleware` | `src/routes/middleware.tsx` | Request vs function middleware, context, `sendContext` |
| `/request-response` | `src/routes/request-response.tsx` | Headers, cookies, status codes, request info |
| `/server-routes` | `src/routes/server-routes.tsx`, `src/routes/api/` | Raw HTTP endpoints (`/api/hello`, `/api/users/$id`) |
| `/static-server-functions` | `src/routes/static-server-functions.tsx` | Build-time server functions (experimental) |

### 4. React Server Components (experimental)
| Route | File | Feature |
| --- | --- | --- |
| `/server-components` | `src/routes/server-components/index.tsx` | `renderServerComponent`, async server components, Suspense |
| `/server-components/composite` | `src/routes/server-components/composite.tsx` | `createCompositeComponent` with client slots |
| `/server-components/with-query` | `src/routes/server-components/with-query.tsx` | Caching RSCs in TanStack Query |

### 5. Execution model
| Route | File | Feature |
| --- | --- | --- |
| `/execution-model` | `src/routes/execution-model.tsx` | `createIsomorphicFn`, `createServerOnlyFn`, `createClientOnlyFn`, `.server.ts` |
| `/environment-variables` | `src/routes/environment-variables.tsx` | `VITE_` variables vs `process.env` secrets |
| `/hydration` | `src/routes/hydration.tsx` | `useHydrated`, `<ClientOnly>`, avoiding hydration mismatches |

### 6. Rendering modes
| Route | File | Feature |
| --- | --- | --- |
| `/selective-ssr` | `src/routes/selective-ssr/` | `ssr: true \| false \| 'data-only' \| (ctx) => …` |
| `/deferred-hydration` | `src/routes/deferred-hydration.tsx` | `<Hydrate when={visible()}>` and other strategies (experimental) |
| `/static-prerendering` | `src/routes/static-prerendering.tsx` | Prerendering pages at build time |
| `/isr` | `src/routes/isr.tsx` | Incremental static regeneration with `Cache-Control` |
| `/spa-mode` | `src/routes/spa-mode.tsx` | Turning SSR off for the whole app (documented, not enabled) |

### 7. Auth & app shell
| Route | File | Feature |
| --- | --- | --- |
| `/auth` | `src/routes/auth/`, `src/utils/auth.functions.ts` | Cookie sessions, guard layout, protected server functions, roles |
| `/entry-points` | `src/routes/entry-points.tsx` | How the config and entry files fit together |

## Project structure

```
src/
├── routes/                 ← one feature per route (start here)
│   ├── __root.tsx          ← HTML shell
│   ├── api/                ← server routes (HTTP endpoints)
│   └── -components/        ← "-" prefix: colocated files ignored by the router
├── utils/*.functions.ts    ← createServerFn wrappers (safe to import anywhere)
├── server/*.server.ts      ← server-only code (in-memory "db", sessions, secrets)
├── middleware/             ← middleware used by start.ts and the middleware demo
├── components/             ← shared UI (layout, error boundary, 404)
├── router.tsx  start.ts  server.ts  client.tsx
└── routeTree.gen.ts        ← generated by the Vite plugin, don't edit
```

The "database" is an in-memory object (`src/server/db.server.ts`), so data resets when the server restarts.

## Things to keep in mind while reading

- **Code is isomorphic by default.** Loaders and components run on the server _and_ in the browser. Anything
  server-only (DB, secrets, `fs`) goes inside `createServerFn`.
- **Server functions are public HTTP endpoints.** Validate their input and check auth inside them (or in middleware);
  route guards only control the UI.
- Server Components, static server functions and deferred hydration are marked **experimental** by TanStack.

## Official docs

- TanStack Start: https://tanstack.com/start/latest/docs/framework/react/overview
- TanStack Router: https://tanstack.com/router/latest/docs/framework/react/overview
