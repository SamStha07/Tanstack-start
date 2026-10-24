/**
 * ROUTE LOADERS — src/routes/loaders.tsx  →  "/loaders"
 * ============================================================================
 * A `loader` fetches the data a route needs BEFORE it renders.
 *
 * ⚠️  Loaders are ISOMORPHIC. On the first page load the loader runs on the
 *    SERVER (data is serialized into the HTML); on later client-side
 *    navigations it runs in the BROWSER. So:
 *      ✗ never touch a database / secret / fs directly inside a loader
 *      ✓ call a server function (createServerFn) from the loader instead —
 *        on the server it's a direct call, in the browser it's a fetch.
 *
 * Options used below:
 *   loader({ params, deps, context, abortController, cause, preload })
 *   loaderDeps      → which search params the loader depends on (cache key)
 *   staleTime       → how long loader data counts as fresh (default 0)
 *   gcTime          → how long unused data stays in the cache (default 30 min)
 *   pendingComponent→ shown while the loader is running (after pendingMs)
 *   pendingMs       → wait this long before showing pendingComponent (1000)
 *   pendingMinMs    → once shown, show it at least this long (avoids flashes)
 *   shouldReload    → fine-grained control over re-running
 *
 * Read data in the component with `Route.useLoaderData()`.
 * Refresh it after a mutation with `router.invalidate()`.
 *
 * The router cache is "stale-while-revalidate": stale data is shown
 * immediately and refreshed in the background.
 *
 * Docs: https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
 */
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { Callout, Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { sleep } from '~/server/db.server'

// The server function is the server-only part. The loader merely calls it.
const getServerTime = createServerFn({ method: 'GET' })
  .validator(z.object({ delay: z.number() }))
  .handler(async ({ data }) => {
    await sleep(data.delay)
    return { time: new Date().toLocaleTimeString(), nodeVersion: process.version, delay: data.delay }
  })

export const Route = createFileRoute('/loaders')({
  validateSearch: z.object({ delay: z.number().catch(400).default(400) }),
  loaderDeps: ({ search }) => ({ delay: search.delay }),
  loader: async ({ deps, cause }) => {
    const result = await getServerTime({ data: { delay: deps.delay } })
    // `cause` tells you why the loader ran: 'enter' | 'stay' | 'preload'
    return { ...result, cause }
  },
  staleTime: 5_000, // data is fresh for 5s → navigating back within 5s won't refetch
  pendingMs: 200, // show pendingComponent if loading takes > 200ms …
  pendingMinMs: 400, // … and then keep it at least 400ms
  pendingComponent: () => (
    <div className="stack" style={{ maxWidth: 'none' }}>
      <h1>Loading…</h1>
      <div className="skeleton" style={{ height: 120 }} />
      <p className="muted">This is the route&apos;s pendingComponent.</p>
    </div>
  ),
  component: LoadersPage,
})

function LoadersPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const navigate = Route.useNavigate()

  return (
    <FeaturePage
      title="Route loaders"
      file="src/routes/loaders.tsx"
      docs="https://tanstack.com/router/latest/docs/framework/react/guide/data-loading"
      intro={<p>Data is ready before the component renders — no loading spinners inside components, no waterfalls.</p>}
    >
      <Demo title="Loader result">
        <Code>{JSON.stringify(data, null, 2)}</Code>
        <div className="row">
          <button onClick={() => router.invalidate()}>router.invalidate() — re-run loader</button>
          <button onClick={() => navigate({ search: { delay: 1500 } })}>slow (1500ms) → see pendingComponent</button>
          <button onClick={() => navigate({ search: { delay: 400 } })}>normal (400ms)</button>
        </div>
        <p className="muted">
          <code>nodeVersion</code> proves the work happened on the server, even when the loader ran in the browser — it
          called a server function.
        </p>
      </Demo>
      <Callout kind="warning">
        Don&apos;t <code>fetch(&apos;/api/…&apos;)</code> a relative URL in a loader: during SSR there is no browser
        origin. Call a server function instead.
      </Callout>
      <Code>{`
const getServerTime = createServerFn({ method: 'GET' })
  .validator(z.object({ delay: z.number() }))
  .handler(async ({ data }) => { /* server-only work */ })

export const Route = createFileRoute('/loaders')({
  validateSearch: z.object({ delay: z.number().catch(400).default(400) }),
  loaderDeps: ({ search }) => ({ delay: search.delay }),
  loader: ({ deps }) => getServerTime({ data: { delay: deps.delay } }),
  staleTime: 5_000,
  pendingComponent: () => <Spinner />,
})
      `}</Code>
    </FeaturePage>
  )
}
