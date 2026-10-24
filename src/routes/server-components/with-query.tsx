/**
 * RSC + TANSTACK QUERY — src/routes/server-components/with-query.tsx
 *   →  "/server-components/with-query"          (experimental feature)
 * ============================================================================
 * A server component is just a value returned by a server function, so
 * TanStack Query can cache it like any other data.
 *
 * The ONE rule: set `structuralSharing: false`. Query normally merges old and
 * new results to keep references stable; RSC payloads must never be merged.
 *
 *   const clockQuery = queryOptions({
 *     queryKey: ['rsc-clock'],
 *     queryFn: () => getClock(),
 *     structuralSharing: false,   // ← required for RSC values
 *   })
 *
 * Prefetch in the loader (SSR) → read with useSuspenseQuery → refresh with
 * refetch()/invalidateQueries(). Here we also use `refetchInterval` to get a
 * fresh server render every 5 seconds.
 *
 * Who owns the cache? With Query, refresh through Query
 * (invalidateQueries / refetch), NOT router.invalidate().
 */
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { renderServerComponent } from '@tanstack/react-start/rsc'
import os from 'node:os'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'
import styles from './-components/rsc.module.css'

function ServerClock() {
  const load = os.loadavg().map((n) => n.toFixed(2)).join(' / ')
  const mem = Math.round((1 - os.freemem() / os.totalmem()) * 100)
  return (
    <div className={styles.panel}>
      <span className={styles.badge}>server component cached by TanStack Query</span>
      <p style={{ fontSize: '1.6rem', margin: '0.25rem 0' }}>{new Date().toLocaleTimeString()}</p>
      <p className="muted">
        load avg: {load} · memory used: {mem}%
      </p>
    </div>
  )
}

const getClock = createServerFn({ method: 'GET' }).handler(async () => ({
  Clock: await renderServerComponent(<ServerClock />),
}))

const clockQuery = queryOptions({
  queryKey: ['rsc-clock'],
  queryFn: () => getClock(),
  structuralSharing: false,
  staleTime: 5_000,
})

export const Route = createFileRoute('/server-components/with-query')({
  loader: ({ context }) => context.queryClient.ensureQueryData(clockQuery),
  component: WithQueryPage,
})

function WithQueryPage() {
  const { data, refetch, isFetching, dataUpdatedAt } = useSuspenseQuery({ ...clockQuery, refetchInterval: 5_000 })
  return (
    <FeaturePage
      title="RSC + TanStack Query"
      file="src/routes/server-components/with-query.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/server-components"
      intro={<p>The server component is a query result: cached, refetched every 5s, refreshable on demand.</p>}
    >
      <Demo title="useSuspenseQuery returning a server component">
        {data.Clock}
        <div className="row">
          <button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'fetching…' : 'refetch() now'}
          </button>
          <span className="muted">last updated {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
        </div>
      </Demo>
      <Code>{`
const clockQuery = queryOptions({
  queryKey: ['rsc-clock'],
  queryFn: () => getClock(),      // returns { Clock: <rendered RSC> }
  structuralSharing: false,       // required!
})
loader: ({ context }) => context.queryClient.ensureQueryData(clockQuery)
const { data } = useSuspenseQuery(clockQuery)
return data.Clock
      `}</Code>
    </FeaturePage>
  )
}
