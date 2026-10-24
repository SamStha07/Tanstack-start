/**
 * src/routes/auth/_protected.tsx — PATHLESS GUARD LAYOUT (no URL segment)
 *
 * Every route inside src/routes/auth/_protected/ goes through this
 * beforeLoad first. If nobody is logged in we throw redirect() to the login
 * page, remembering where the user wanted to go.
 *
 * Because beforeLoad runs before any child loader, protected loaders never
 * even start for anonymous users. On the first request this runs on the
 * server, so the redirect is a real HTTP 307.
 *
 * We also NARROW the type: after this check, children see `context.user`
 * as non-null.
 */
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/_protected')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: '/auth', search: { redirect: location.href } })
    }
    return { user: context.user } // now typed as non-null for children
  },
  component: () => <Outlet />,
})
