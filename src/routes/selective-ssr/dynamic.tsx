/**
 * src/routes/selective-ssr/dynamic.tsx  →  "/selective-ssr/dynamic?mode=…"
 *
 * The functional form decides at request time. It runs on the server only
 * (for the initial request) and receives the validated params/search as
 * `{ status: 'success', value }` or `{ status: 'error', error }`.
 */
import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Demo } from '~/components/FeaturePage'
import { Report, where } from './-components/where'

export const Route = createFileRoute('/selective-ssr/dynamic')({
  validateSearch: z.object({ mode: z.enum(['full', 'data-only', 'none']).catch('full').default('full') }),
  ssr: ({ search }) => {
    if (search.status !== 'success') return true
    if (search.value.mode === 'none') return false
    if (search.value.mode === 'data-only') return 'data-only'
    return true
  },
  loader: () => ({ loaderRanOn: where() }),
  pendingComponent: () => <p className="skeleton">pendingComponent (server HTML)</p>,
  component: Page,
})

function Page() {
  const { loaderRanOn } = Route.useLoaderData()
  const { mode } = Route.useSearch()
  return (
    <Demo title={`ssr: (ctx) => … — mode=${mode}`}>
      <div className="row">
        {(['full', 'data-only', 'none'] as const).map((m) => (
          <Link key={m} to="/selective-ssr/dynamic" search={{ mode: m }} reloadDocument>
            mode={m}
          </Link>
        ))}
      </div>
      <Report loaderRanOn={loaderRanOn} componentRenderedOn={where()} />
    </Demo>
  )
}
