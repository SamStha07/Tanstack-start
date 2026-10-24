/**
 * src/routes/auth/_protected/dashboard.tsx  →  "/auth/dashboard"
 *
 * Only reachable through the _protected guard. Its loader calls a server
 * function protected by authMiddleware — defense in depth.
 */
import { createFileRoute } from '@tanstack/react-router'
import { Code, Demo } from '~/components/FeaturePage'
import { getMyDashboard } from '~/utils/auth.functions'

export const Route = createFileRoute('/auth/_protected/dashboard')({
  loader: () => getMyDashboard(),
  component: Dashboard,
})

function Dashboard() {
  const data = Route.useLoaderData()
  const { user } = Route.useRouteContext() // non-null thanks to _protected.tsx
  return (
    <Demo title={`Dashboard for ${user.email}`}>
      <h3>{data.greeting}</h3>
      <Code>{JSON.stringify(data, null, 2)}</Code>
    </Demo>
  )
}
