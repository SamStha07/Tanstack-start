/**
 * AUTHENTICATION — src/routes/auth/route.tsx  →  layout for "/auth/*"
 * ============================================================================
 * Files in this feature:
 *
 *   src/server/session.server.ts     cookie session helpers (server only)
 *   src/utils/auth.functions.ts      login / logout / getCurrentUser server
 *                                    functions + authMiddleware (THE real
 *                                    security boundary)
 *   src/routes/auth/route.tsx        this layout: loads the user into context
 *   src/routes/auth/index.tsx        "/auth" — login form
 *   src/routes/auth/_protected.tsx   pathless layout that redirects anonymous
 *                                    users to the login page (UX guard)
 *   src/routes/auth/_protected/dashboard.tsx  "/auth/dashboard" (any user)
 *   src/routes/auth/_protected/admin.tsx      "/auth/admin"     (admins only)
 *
 * Flow:
 *   1. This layout's beforeLoad calls getCurrentUser() and returns { user }
 *      → every child route gets `context.user`.
 *   2. After login/logout we call router.invalidate() so beforeLoad re-runs
 *      and the whole tree sees the new user.
 *
 * Demo accounts:  admin@example.com / admin123   user@example.com / user123
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/authentication-overview
 */
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { FeaturePage } from '~/components/FeaturePage'
import { getCurrentUser, logout } from '~/utils/auth.functions'

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => ({ user: await getCurrentUser() }),
  component: AuthLayout,
})

function AuthLayout() {
  const { user } = Route.useRouteContext()
  // useServerFn is REQUIRED here: logout throws redirect(), and the hook lets
  // the router perform that navigation.
  const logoutFn = useServerFn(logout)

  return (
    <FeaturePage
      title="Authentication"
      file="src/routes/auth/ (+ src/utils/auth.functions.ts, src/server/session.server.ts)"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/authentication-overview"
      intro={<p>Cookie sessions, a route guard for UX, and middleware that protects the data.</p>}
    >
      <div className="card row">
        {user ? (
          <>
            Logged in as <strong>{user.name}</strong> <span className="pill">{user.role}</span>
            <button onClick={() => logoutFn()}>Log out</button>
          </>
        ) : (
          <span className="muted">Not logged in</span>
        )}
      </div>
      <nav className="tabs">
        <Link to="/auth" activeOptions={{ exact: true }} activeProps={{ className: 'active' }}>
          login
        </Link>
        <Link to="/auth/dashboard" activeProps={{ className: 'active' }}>
          dashboard (protected)
        </Link>
        <Link to="/auth/admin" activeProps={{ className: 'active' }}>
          admin (admins only)
        </Link>
      </nav>
      <Outlet />
    </FeaturePage>
  )
}
