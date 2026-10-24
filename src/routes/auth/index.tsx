/**
 * src/routes/auth/index.tsx  →  "/auth?redirect=…"  (login page)
 *
 * - `redirect` search param: where to go after login (set by the guard in
 *   _protected.tsx).
 * - After a successful login: router.invalidate() re-runs beforeLoad in
 *   route.tsx (so `context.user` is fresh), then we navigate.
 * - The "call without logging in" button proves the server function is
 *   protected even if you bypass the UI.
 */
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { z } from 'zod'
import { Callout, Code, Demo } from '~/components/FeaturePage'
import { getMyDashboard, login } from '~/utils/auth.functions'

export const Route = createFileRoute('/auth/')({
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
  component: LoginPage,
})

function LoginPage() {
  const { user } = Route.useRouteContext()
  const { redirect } = Route.useSearch()
  const router = useRouter()
  const loginFn = useServerFn(login)
  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('user123')
  const [error, setError] = useState<string | null>(null)
  const [probe, setProbe] = useState<string | null>(null)

  return (
    <>
      {redirect && (
        <Callout kind="warning">
          You were redirected here by the route guard. After logging in you&apos;ll go to <code>{redirect}</code>.
        </Callout>
      )}
      {!user && (
        <Demo title="Log in">
          <form
            className="stack"
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              try {
                await loginFn({ data: { email, password } })
                await router.invalidate() // refresh context.user everywhere
                // Only allow internal redirects (avoid open-redirect bugs)
                if (redirect?.startsWith('/')) await router.history.push(redirect)
                else await router.navigate({ to: '/auth/dashboard' })
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err))
              }
            }}
          >
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" />
            <button>Log in</button>
            {error && <span style={{ color: 'var(--danger)' }}>{error}</span>}
          </form>
          <p className="muted">
            admin@example.com / admin123 · user@example.com / user123 · or try a wrong password
          </p>
        </Demo>
      )}
      <Demo title="Is the data really protected?">
        <button
          onClick={async () => {
            try {
              const result = await getMyDashboard()
              setProbe(`✅ allowed: ${JSON.stringify(result)}`)
            } catch (err) {
              setProbe(`⛔ rejected by authMiddleware: ${err instanceof Error ? err.message : String(err)}`)
            }
          }}
        >
          Call getMyDashboard() directly
        </button>
        {probe && <p>{probe}</p>}
        <p className="muted">Log out and click again — the server refuses, no matter what the UI does.</p>
      </Demo>
      <Code>{`
// the real protection: middleware on the server function
export const getMyDashboard = createServerFn()
  .middleware([authMiddleware])
  .handler(({ context }) => ({ greeting: \`Hi \${context.user.name}\` }))

// the UX guard: src/routes/auth/_protected.tsx
beforeLoad: ({ context, location }) => {
  if (!context.user) throw redirect({ to: '/auth', search: { redirect: location.href } })
}
      `}</Code>
    </>
  )
}
