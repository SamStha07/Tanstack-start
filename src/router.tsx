/**
 * ROUTER FACTORY — src/router.tsx
 * ----------------------------------------------------------------------------
 * TanStack Start looks for a `getRouter()` export in this file. It is called:
 *   - once per incoming request on the SERVER (so every request gets its own
 *     router + its own QueryClient — no data leaks between users), and
 *   - once in the BROWSER when the app hydrates.
 *
 * Things configured here apply to every route:
 *   - `routeTree`            → generated from the files in src/routes by the
 *                               Start Vite plugin (never edit routeTree.gen.ts).
 *   - `context`              → an object every route receives in beforeLoad /
 *                               loader as `context` (we inject a QueryClient).
 *   - `defaultPreload`       → 'intent' = start loading a route when the user
 *                               hovers / focuses a <Link> to it.
 *   - `defaultErrorComponent`/`defaultNotFoundComponent` → fallbacks used when a
 *                               route doesn't define its own.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/routing
 */
import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { DefaultCatchBoundary } from './components/DefaultCatchBoundary'
import { NotFound } from './components/NotFound'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  // Create the QueryClient INSIDE getRouter (never at module scope) so each
  // SSR request has an isolated cache.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  })

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    // Let TanStack Query decide freshness for preloads.
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
  })

  // Wires Query into SSR: provides <QueryClientProvider>, dehydrates the cache
  // into the HTML on the server and hydrates it in the browser.
  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}
