/**
 * src/routes/selective-ssr/ssr-false.tsx  →  "/selective-ssr/ssr-false"
 *
 * `ssr: false`: beforeLoad, loader AND component all run in the browser,
 * so the loader may read localStorage.
 */
import { createFileRoute } from '@tanstack/react-router'
import { Demo } from '~/components/FeaturePage'
import { Report, where } from './-components/where'

export const Route = createFileRoute('/selective-ssr/ssr-false')({
  ssr: false,
  loader: () => {
    // Would crash on the server — fine here.
    const visits = Number(localStorage.getItem('ssr-false-visits') ?? '0') + 1
    localStorage.setItem('ssr-false-visits', String(visits))
    return { loaderRanOn: where(), visits }
  },
  pendingComponent: () => <p className="skeleton">pendingComponent (server HTML)</p>,
  component: Page,
})

function Page() {
  const { loaderRanOn, visits } = Route.useLoaderData()
  return (
    <Demo title="ssr: false">
      <Report
        loaderRanOn={loaderRanOn}
        componentRenderedOn={where()}
        extra={
          <tr>
            <th>visits (localStorage, read in the loader)</th>
            <td>{visits}</td>
          </tr>
        }
      />
    </Demo>
  )
}
