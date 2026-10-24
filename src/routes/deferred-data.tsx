/**
 * DEFERRED / STREAMED DATA — src/routes/deferred-data.tsx  →  "/deferred-data"
 * ============================================================================
 * By default the router waits for the loader to finish before rendering.
 * If some data is slow and NOT critical, return the *promise* instead of
 * awaiting it:
 *
 *   loader: async () => {
 *     const fast = await getFast()   // awaited → blocks rendering
 *     const slow = getSlow()         // NOT awaited → streamed later
 *     return { fast, slow }
 *   }
 *
 * During SSR, Start sends the HTML for the page immediately (with Suspense
 * fallbacks), keeps the HTTP response open, and STREAMS each promise's result
 * into the same response when it resolves. On client navigations it works the
 * same way without the HTML part.
 *
 * Consume a deferred promise with either:
 *   <Await promise={slow} fallback={…}>{(value) => …}</Await>
 *   or React 19's  `use(slow)`  inside a <Suspense> boundary.
 *
 * Errors in a deferred promise are thrown at the <Await>/use() site and caught
 * by the nearest error boundary.
 *
 * Docs: https://tanstack.com/router/latest/docs/framework/react/guide/deferred-data-loading
 */
import { Await, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Suspense, use } from 'react'
import { z } from 'zod'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { sleep } from '~/server/db.server'

const getData = createServerFn({ method: 'GET' })
  .validator(z.object({ label: z.string(), ms: z.number() }))
  .handler(async ({ data }) => {
    await sleep(data.ms)
    return { label: data.label, ms: data.ms, at: new Date().toLocaleTimeString() }
  })

export const Route = createFileRoute('/deferred-data')({
  loader: async () => {
    // awaited: the page doesn't render until this is done
    const critical = await getData({ data: { label: 'critical', ms: 100 } })
    // not awaited: streamed in after the page is visible
    const recommendations = getData({ data: { label: 'recommendations', ms: 1500 } })
    const reviews = getData({ data: { label: 'reviews', ms: 3000 } })
    return { critical, recommendations, reviews }
  },
  component: DeferredPage,
})

function DeferredPage() {
  const { critical, recommendations, reviews } = Route.useLoaderData()
  return (
    <FeaturePage
      title="Deferred / streamed data"
      file="src/routes/deferred-data.tsx"
      docs="https://tanstack.com/router/latest/docs/framework/react/guide/deferred-data-loading"
      intro={
        <p>
          Reload this page: the critical part shows immediately, the other two stream in after 1.5s and 3s — over
          the <strong>same</strong> HTTP response.
        </p>
      }
    >
      <Demo title="Awaited (critical) data">
        <div className="card">
          ✅ {critical.label} — loaded at {critical.at}
        </div>
      </Demo>

      <Demo title="Deferred with <Await>">
        <Await promise={recommendations} fallback={<div className="skeleton" style={{ height: 48 }} />}>
          {(value) => (
            <div className="card">
              ✅ {value.label} — arrived after {value.ms}ms (at {value.at})
            </div>
          )}
        </Await>
      </Demo>

      <Demo title="Deferred with React 19 use() + <Suspense>">
        <Suspense fallback={<div className="skeleton" style={{ height: 48 }} />}>
          <Reviews promise={reviews} />
        </Suspense>
      </Demo>

      <Code>{`
loader: async () => ({
  critical: await getData(...), // blocks
  reviews: getData(...),        // streamed (a Promise)
})

<Await promise={reviews} fallback={<Skeleton/>}>{(r) => <Reviews r={r}/>}</Await>
// or
function Reviews({ promise }) { const r = use(promise); ... }
      `}</Code>
    </FeaturePage>
  )
}

function Reviews({ promise }: { promise: Promise<{ label: string; ms: number; at: string }> }) {
  const value = use(promise)
  return (
    <div className="card">
      ✅ {value.label} — arrived after {value.ms}ms (at {value.at})
    </div>
  )
}
