/**
 * src/routes/route-context.index.tsx  →  "/route-context" (index child)
 *
 * A CHILD route automatically inherits its parent's context. It can also add
 * its own with another beforeLoad, which runs AFTER the parent's.
 */
import { createFileRoute } from '@tanstack/react-router'
import { Demo } from '~/components/FeaturePage'

export const Route = createFileRoute('/route-context/')({
  beforeLoad: ({ context }) => ({
    // Parent context is already here (typed!) because parent beforeLoad ran first.
    childGreeting: `Child sees betaSearch=${context.featureFlags.betaSearch}`,
  }),
  component: ChildRoute,
})

function ChildRoute() {
  const { childGreeting, featureFlags } = Route.useRouteContext()
  return (
    <Demo title="Context inherited by the child route (route-context.index.tsx)">
      <p>{childGreeting}</p>
      <p>
        Inherited <code>featureFlags</code>: <code>{JSON.stringify(featureFlags)}</code>
      </p>
    </Demo>
  )
}
