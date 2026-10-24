/**
 * ERRORS & NOT FOUND — src/routes/error-handling.tsx  →  "/error-handling"
 * ============================================================================
 * Every route can define:
 *   errorComponent({ error, reset, info })
 *       Rendered when beforeLoad / loader / the component throws.
 *       Without one, the error bubbles to the parent route … up to the
 *       router's `defaultErrorComponent` (src/router.tsx).
 *   notFoundComponent({ data })
 *       Rendered when beforeLoad / loader (or a server function they call)
 *       throws `notFound()`. Unmatched URLs use the root's notFoundComponent.
 *   onError(error)
 *       Side effect hook (logging / reporting).
 *
 * Errors thrown inside a server function are serialized and re-thrown on the
 * caller side — so a loader awaiting a failing server fn lands in
 * errorComponent too.
 *
 * `reset()` clears the boundary; combine with `router.invalidate()` to re-run
 * the loader. During SSR, an errored route responds with HTTP 500 and a
 * notFound with HTTP 404.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/error-boundaries
 */
import { ErrorComponent, createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { z } from 'zod'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'

const loadThing = createServerFn({ method: 'GET' })
  .validator(z.object({ mode: z.enum(['ok', 'error', 'notFound']) }))
  .handler(({ data }) => {
    if (data.mode === 'error') throw new Error('💥 The server function threw an Error')
    if (data.mode === 'notFound') throw notFound({ data: { reason: 'Thing #42 is not in the database' } })
    return { thing: 'Everything is fine 🌴' }
  })

export const Route = createFileRoute('/error-handling')({
  validateSearch: z.object({ mode: z.enum(['ok', 'error', 'notFound']).catch('ok').default('ok') }),
  loaderDeps: ({ search }) => ({ mode: search.mode }),
  loader: ({ deps }) => loadThing({ data: { mode: deps.mode } }),
  onError: (error) => console.warn('[error-handling] onError:', error.message),
  errorComponent: ({ error, reset }) => {
    const router = useRouter()
    return (
      <Shell>
        <div className="error-box">
          <h2>Route-level errorComponent</h2>
          <ErrorComponent error={error} />
          <button
            onClick={async () => {
              await router.navigate({ to: '/error-handling', search: { mode: 'ok' } })
              reset()
            }}
          >
            reset() and go back to mode=ok
          </button>
        </div>
      </Shell>
    )
  },
  notFoundComponent: ({ data }) => (
    <Shell>
      <div className="error-box">
        <h2>Route-level notFoundComponent</h2>
        {/* `data` is whatever was passed to notFound({ data }); it is typed
            as unknown, so narrow it before use. */}
        <p>Reason: {isReason(data) ? data.reason : 'n/a'}</p>
      </div>
    </Shell>
  ),
  component: ErrorPage,
})

function isReason(value: unknown): value is { reason: string } {
  return typeof value === 'object' && value !== null && 'reason' in value && typeof value.reason === 'string'
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <FeaturePage
      title="Errors & not found"
      file="src/routes/error-handling.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/error-boundaries"
      intro={<p>Pick a mode — each one changes the search param and re-runs the loader.</p>}
    >
      <Modes />
      {children}
    </FeaturePage>
  )
}

function Modes() {
  const navigate = Route.useNavigate()
  return (
    <div className="row">
      <button onClick={() => navigate({ search: { mode: 'ok' } })}>mode=ok</button>
      <button onClick={() => navigate({ search: { mode: 'error' } })}>mode=error (throw Error)</button>
      <button onClick={() => navigate({ search: { mode: 'notFound' } })}>mode=notFound (throw notFound())</button>
    </div>
  )
}

function ErrorPage() {
  const { thing } = Route.useLoaderData()
  const [explode, setExplode] = useState(false)
  if (explode) throw new Error('💥 The component threw during render')
  return (
    <Shell>
      <Demo title="Loader succeeded">
        <p>{thing}</p>
        <button onClick={() => setExplode(true)}>Throw an error while rendering</button>
      </Demo>
      <Code>{`
export const Route = createFileRoute('/error-handling')({
  loader: () => loadThing(...),            // may throw Error or notFound()
  errorComponent: ({ error, reset }) => <ErrorComponent error={error} />,
  notFoundComponent: ({ data }) => <p>Not found</p>,
})
      `}</Code>
    </Shell>
  )
}
