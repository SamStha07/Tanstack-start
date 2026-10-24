/**
 * src/routes/navigation_.old-page.tsx  →  "/navigation/old-page"
 *
 * Demonstrates `redirect()`. Throwing it from `beforeLoad` (or `loader`, or a
 * server function) stops the current navigation and starts a new one.
 * On the server (first page load) it becomes an HTTP 307 redirect response;
 * during client navigation it is just a client-side redirect.
 *
 * This route has no component because it never renders.
 *
 * Note the trailing underscore in `navigation_`: it keeps the URL
 * "/navigation/old-page" but UN-NESTS the route, so it is NOT rendered inside
 * navigation.tsx (which has no <Outlet />). Without the underscore it would be
 * a child of /navigation.
 */
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/navigation_/old-page')({
  beforeLoad: () => {
    throw redirect({ to: '/navigation', hash: 'blocker', statusCode: 301 })
  },
})
