/**
 * SELECTIVE SSR — src/routes/selective-ssr/route.tsx  →  layout for "/selective-ssr/*"
 * ============================================================================
 * (`route.tsx` inside a folder = that folder's layout route.)
 *
 * By default every route is fully server-rendered on the first request.
 * The `ssr` route option changes that PER ROUTE:
 *
 *   ssr: true          (default) beforeLoad + loader run on the server,
 *                      component is rendered to HTML on the server.
 *   ssr: 'data-only'   beforeLoad + loader run on the server (data is sent
 *                      to the browser), but the component renders ONLY in
 *                      the browser. For components that need window/canvas…
 *   ssr: false         nothing runs on the server for this route: beforeLoad,
 *                      loader and component all run in the browser. For
 *                      loaders that need localStorage etc.
 *   ssr: (ctx) => …    decide at request time from params/search.
 *
 * Children inherit and can only get MORE restrictive (a child of a
 * `ssr: false` route can't turn SSR back on). While a non-SSR'd component
 * waits for the browser, the route's `pendingComponent` (or the router's
 * default) is what ends up in the HTML.
 *
 * App-wide default: `createStart(() => ({ defaultSsr: false }))` in src/start.ts.
 *
 * Only the FIRST request is affected: client-side navigations always run in
 * the browser anyway.
 *
 * TIP: open each tab with a full page reload and use View Source.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr
 */
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { FeaturePage } from '~/components/FeaturePage'

export const Route = createFileRoute('/selective-ssr')({
  component: SelectiveSsrLayout,
})

const tabs = [
  { to: '/selective-ssr', label: 'overview' },
  { to: '/selective-ssr/ssr-true', label: "ssr: true" },
  { to: '/selective-ssr/data-only', label: "ssr: 'data-only'" },
  { to: '/selective-ssr/ssr-false', label: 'ssr: false' },
  { to: '/selective-ssr/dynamic', label: 'ssr: (ctx) => …' },
] as const

function SelectiveSsrLayout() {
  return (
    <FeaturePage
      title="Selective SSR"
      file="src/routes/selective-ssr/"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr"
      intro={<p>Choose per route whether loaders and components run on the server for the first request.</p>}
    >
      <nav className="tabs">
        {tabs.map((t) => (
          // reloadDocument → full page load, so you see what the SERVER sends
          <Link key={t.to} to={t.to} reloadDocument activeOptions={{ exact: true }} activeProps={{ className: 'active' }}>
            {t.label}
          </Link>
        ))}
      </nav>
      <p className="muted">These tabs use <code>reloadDocument</code> so each click is a real server request.</p>
      <Outlet />
    </FeaturePage>
  )
}
