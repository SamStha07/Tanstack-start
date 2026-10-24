/**
 * ROUTE CONTEXT & beforeLoad — src/routes/route-context.tsx  →  "/route-context"
 * ============================================================================
 * "Context" is an object that flows DOWN the route tree:
 *
 *   router context (src/router.tsx: `context: { queryClient }`)
 *        ↓ merged with
 *   whatever each parent route's beforeLoad returns
 *        ↓ available in
 *   child beforeLoad / loader / head as `context`, and in components via
 *   `Route.useRouteContext()`.
 *
 * Lifecycle of a navigation (simplified):
 *   1. params.parse / validateSearch   (every matched route)
 *   2. beforeLoad                      SERIAL: parent → child.
 *                                      Return an object to extend context.
 *                                      Throw redirect()/notFound() to abort.
 *   3. loader                          PARALLEL for all matched routes.
 *   4. render components
 *
 * Both beforeLoad and loader are ISOMORPHIC: on the first request they run on
 * the server, after that in the browser. (See /execution-model.)
 *
 * Use cases: auth (put `user` in context, see src/routes/auth/_protected.tsx),
 * injecting API clients, feature flags, i18n …
 *
 * Docs: https://tanstack.com/router/latest/docs/framework/react/guide/router-context
 */
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { createIsomorphicFn } from '@tanstack/react-start'
import { Code, Demo, Explain, FeaturePage } from '~/components/FeaturePage'

// Tells us WHERE beforeLoad ran (see /execution-model for createIsomorphicFn).
const whereAmI = createIsomorphicFn()
  .server(() => 'server')
  .client(() => 'browser')

export const Route = createFileRoute('/route-context')({
  beforeLoad: ({ context }) => {
    // `context.queryClient` comes from src/router.tsx and is fully typed.
    const hasQueryClient = Boolean(context.queryClient)
    // Whatever we return is merged into the context for this route + children.
    return {
      featureFlags: { newDashboard: true, betaSearch: false },
      beforeLoadRanOn: whereAmI(),
      beforeLoadAt: new Date().toLocaleTimeString(),
      hasQueryClient,
    }
  },
  loader: ({ context }) => {
    // The loader sees the context returned by beforeLoad.
    return { message: `newDashboard flag is ${context.featureFlags.newDashboard ? 'ON' : 'OFF'}` }
  },
  component: RouteContextPage,
})

function RouteContextPage() {
  // Select just what you need (optional `select` avoids unnecessary renders).
  const ctx = Route.useRouteContext({
    select: ({ featureFlags, beforeLoadRanOn, beforeLoadAt, hasQueryClient }) => ({
      featureFlags,
      beforeLoadRanOn,
      beforeLoadAt,
      hasQueryClient,
    }),
  })
  const { message } = Route.useLoaderData()

  return (
    <FeaturePage
      title="Route context & beforeLoad"
      file="src/routes/route-context.tsx (+ route-context.index.tsx)"
      docs="https://tanstack.com/router/latest/docs/framework/react/guide/router-context"
      intro={<p>Dependency injection for your route tree, computed in <code>beforeLoad</code>.</p>}
    >
      <Demo title="Context produced by this route's beforeLoad">
        <Code>{JSON.stringify(ctx, null, 2)}</Code>
        <p>
          Loader says: <strong>{message}</strong>
        </p>
        <p className="muted">
          Reload the page → <code>beforeLoadRanOn</code> is &quot;server&quot;. Navigate away and back using the
          sidebar → it becomes &quot;browser&quot;.
        </p>
      </Demo>
      <Outlet />
      <Explain title="Pattern">
        <Code>{`
// src/routes/__root.tsx
createRootRouteWithContext<{ queryClient: QueryClient }>()({ ... })

// src/router.tsx
createRouter({ routeTree, context: { queryClient } })

// any route
beforeLoad: ({ context }) => ({ user: await getUser() }),   // extend
loader:     ({ context }) => context.user.id,               // consume
const user = Route.useRouteContext({ select: (c) => c.user })
        `}</Code>
      </Explain>
    </FeaturePage>
  )
}
