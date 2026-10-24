/**
 * TANSTACK QUERY — src/routes/tanstack-query.tsx  →  "/tanstack-query"
 * ============================================================================
 * Router loaders decide WHEN to fetch (on navigation). TanStack Query can OWN
 * the data: caching across routes, background refetching, mutations,
 * optimistic updates, devtools …
 *
 * Setup (already done in src/router.tsx):
 *   - create the QueryClient INSIDE getRouter() (one per request on the server)
 *   - put it in router context:  createRouter({ context: { queryClient } })
 *   - setupRouterSsrQueryIntegration({ router, queryClient })
 *     → provides <QueryClientProvider>, dehydrates the cache into the SSR
 *       HTML and hydrates it in the browser (no double fetching).
 *
 * Pattern used below:
 *   loader:  await context.queryClient.ensureQueryData(opts)   // critical → in SSR HTML
 *            context.queryClient.prefetchQuery(opts2)          // NOT awaited → streamed
 *   component: useSuspenseQuery(opts)                          // reads the same cache
 *   mutation:  useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries(...) })
 *
 * Note: we call server functions from queryFn — Query doesn't care, it just
 * sees an async function.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/tanstack-query
 */
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Suspense, useState } from 'react'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { guestbookQuery, guestbookStatsQuery, signGuestbook } from '~/utils/guestbook.functions'

export const Route = createFileRoute('/tanstack-query')({
  loader: async ({ context }) => {
    // Critical: wait for it so it is part of the server-rendered HTML.
    await context.queryClient.ensureQueryData(guestbookQuery)
    // Secondary: start it but don't wait — the SSR integration streams it.
    // (`void` = intentionally not awaited.)
    void context.queryClient.prefetchQuery(guestbookStatsQuery)
  },
  // Personalized/mutable data → don't let CDNs cache this page.
  headers: () => ({ 'Cache-Control': 'private, no-store' }),
  component: QueryPage,
})

function QueryPage() {
  return (
    <FeaturePage
      title="TanStack Query"
      file="src/routes/tanstack-query.tsx (+ src/utils/guestbook.functions.ts)"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/tanstack-query"
      intro={<p>SSR-prefetched queries, streaming, and a mutation that invalidates the cache. Sign the guestbook!</p>}
    >
      <Demo title="Guestbook (useSuspenseQuery + useMutation)">
        <SignForm />
        <Entries />
      </Demo>
      <Demo title="Slow query streamed with <Suspense> (prefetchQuery not awaited)">
        <Suspense fallback={<div className="skeleton" style={{ height: 40 }} />}>
          <Stats />
        </Suspense>
      </Demo>
      <Code>{`
// loader
await context.queryClient.ensureQueryData(guestbookQuery)
void context.queryClient.prefetchQuery(guestbookStatsQuery)

// component
const { data } = useSuspenseQuery(guestbookQuery)

// mutation
const mutation = useMutation({
  mutationFn: (vars) => sign({ data: vars }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guestbook'] }),
})
      `}</Code>
    </FeaturePage>
  )
}

function Entries() {
  // Data is already in the cache (loader) → no loading state on first render.
  const { data, isFetching } = useSuspenseQuery(guestbookQuery)
  return (
    <div>
      <p className="muted">
        fetched at {data.fetchedAt} {isFetching && <span className="pill">refetching…</span>}
      </p>
      {data.entries.length === 0 && <p className="muted">No entries yet — be the first!</p>}
      {data.entries.map((e) => (
        <div key={e.at} className="card">
          <strong>{e.name}</strong>: {e.message}
        </div>
      ))}
    </div>
  )
}

function Stats() {
  const { data } = useSuspenseQuery(guestbookStatsQuery)
  return (
    <p>
      {data.total} {data.total === 1 ? 'entry' : 'entries'} from {data.uniqueNames} unique {data.uniqueNames === 1 ? 'name' : 'names'}.
    </p>
  )
}

function SignForm() {
  const queryClient = useQueryClient()
  const sign = useServerFn(signGuestbook)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: (vars: { name: string; message: string }) => sign({ data: vars }),
    // Returning the promise keeps the mutation "pending" until the refetch is done.
    // ['guestbook'] matches both ['guestbook'] and ['guestbook', 'stats'].
    onSuccess: () => {
      setMessage('')
      return queryClient.invalidateQueries({ queryKey: ['guestbook'] })
    },
  })

  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate({ name, message })
      }}
    >
      <input placeholder="your name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="message" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button disabled={mutation.isPending}>{mutation.isPending ? 'Signing…' : 'Sign guestbook'}</button>
      {mutation.isError && <p style={{ color: 'var(--danger)' }}>{mutation.error.message}</p>}
    </form>
  )
}
