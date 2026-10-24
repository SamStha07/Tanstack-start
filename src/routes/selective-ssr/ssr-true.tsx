/**
 * src/routes/selective-ssr/ssr-true.tsx  →  "/selective-ssr/ssr-true"
 * `ssr: true` (the default — written out here only for clarity).
 */
import { createFileRoute } from '@tanstack/react-router'
import { Demo } from '~/components/FeaturePage'
import { Report, where } from './-components/where'

export const Route = createFileRoute('/selective-ssr/ssr-true')({
  ssr: true,
  loader: () => ({ loaderRanOn: where() }),
  component: Page,
})

function Page() {
  const { loaderRanOn } = Route.useLoaderData()
  return (
    <Demo title="ssr: true">
      <Report loaderRanOn={loaderRanOn} componentRenderedOn={where()} />
      <p className="muted">View source: the table is in the HTML.</p>
    </Demo>
  )
}
