/**
 * src/routes/selective-ssr/data-only.tsx  →  "/selective-ssr/data-only"
 *
 * `ssr: 'data-only'`: the loader runs on the server, but the component only
 * renders in the browser — so the component may touch `window` freely.
 * The pendingComponent is what the server puts in the HTML meanwhile.
 */
import { createFileRoute } from '@tanstack/react-router'
import { Demo } from '~/components/FeaturePage'
import { Report, where } from './-components/where'

export const Route = createFileRoute('/selective-ssr/data-only')({
  ssr: 'data-only',
  loader: () => ({ loaderRanOn: where() }),
  pendingComponent: () => <p className="skeleton">pendingComponent (this is what the server rendered)</p>,
  component: Page,
})

function Page() {
  const { loaderRanOn } = Route.useLoaderData()
  // Safe: this component never renders on the server.
  const screen = `${window.screen.width}×${window.screen.height}`
  return (
    <Demo title="ssr: 'data-only'">
      <Report
        loaderRanOn={loaderRanOn}
        componentRenderedOn={where()}
        extra={
          <tr>
            <th>window.screen (browser API)</th>
            <td>{screen}</td>
          </tr>
        }
      />
    </Demo>
  )
}
