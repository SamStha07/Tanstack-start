/**
 * FILE-BASED ROUTING — src/routes/routing.tsx  →  URL "/routing" (a LAYOUT)
 * ============================================================================
 * TanStack Start uses TanStack Router's file-based routing: every file inside
 * src/routes becomes a route, and the Vite plugin generates
 * src/routeTree.gen.ts (fully typed) from the folder structure.
 *
 * This file is a LAYOUT ROUTE: it has child routes, and renders them where it
 * puts <Outlet />. Its children are:
 *
 *   src/routes/routing.tsx           → layout for "/routing/*"  (this file)
 *   src/routes/routing.index.tsx     → "/routing"        (index child)
 *   src/routes/routing.nested.tsx    → "/routing/nested"
 *   src/routes/routing._pathless.tsx → layout WITHOUT a URL segment
 *   src/routes/routing._pathless.inside.tsx → "/routing/inside"
 *
 * Naming cheat-sheet (works with "." in file names OR with folders):
 *   index.tsx            → index route of a folder ("/")
 *   about.tsx            → "/about"
 *   posts/index.tsx      → "/posts" (same as posts.index.tsx)
 *   posts.$postId.tsx    → "/posts/:postId"          (dynamic param)
 *   files.$.tsx          → "/files/*"                (splat / catch-all)
 *   {-$lang}.tsx         → optional param
 *   _layout.tsx          → pathless layout (prefix "_" = no URL segment)
 *   (group)/x.tsx        → route group: folder name in () is ignored in URL
 *   posts_.edit.tsx      → suffix "_" = break out of parent layout nesting
 *   -components/         → prefix "-" = ignored by the router (colocate files)
 *   route.tsx            → inside a folder: the folder's own layout route
 *   __root.tsx           → the root route
 *
 * Code splitting is automatic: Start splits each route's component into its
 * own chunk, and the loader stays in the main bundle so data can start
 * loading before the component code arrives.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/routing
 */
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { FeaturePage } from '~/components/FeaturePage'

export const Route = createFileRoute('/routing')({
  component: RoutingLayout,
})

function RoutingLayout() {
  return (
    <FeaturePage
      title="File-based routing"
      file="src/routes/routing.tsx (+ routing.*.tsx)"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/routing"
      intro={
        <p>
          This header and the tabs below are rendered by the <strong>layout route</strong> <code>routing.tsx</code>.
          Each tab is a <strong>child route</strong> rendered into the layout&apos;s <code>&lt;Outlet /&gt;</code>.
          Watch the URL change while this header stays mounted.
        </p>
      }
    >
      <nav className="tabs">
        <Link to="/routing" activeOptions={{ exact: true }} activeProps={{ className: 'active' }}>
          /routing (index)
        </Link>
        <Link to="/routing/nested" activeProps={{ className: 'active' }}>
          /routing/nested
        </Link>
        <Link to="/routing/inside" activeProps={{ className: 'active' }}>
          /routing/inside (pathless layout)
        </Link>
      </nav>
      {/* ↓ the matched child route renders here */}
      <Outlet />
    </FeaturePage>
  )
}
