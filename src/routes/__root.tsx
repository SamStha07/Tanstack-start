/**
 * ROOT ROUTE — src/routes/__root.tsx
 * ----------------------------------------------------------------------------
 * The root route wraps EVERY page. In TanStack Start it also renders the whole
 * HTML document (<html>, <head>, <body>) because Start server-renders the full
 * document, not just a <div id="root">.
 *
 * Must-haves in a Start root route:
 *   - <HeadContent />  inside <head>  → renders the merged `head()` tags
 *                                        (title, meta, links) of all matched routes
 *   - <Scripts />      inside <body>  → injects the client JS; without it the
 *                                        page never hydrates (no interactivity!)
 *   - <Outlet />                      → where the matched child route renders
 *
 * `createRootRouteWithContext<T>()` declares the TYPE of the router context
 * (the actual value is passed in src/router.tsx). Every route's `beforeLoad`
 * and `loader` then receives a fully-typed `context` (see /route-context).
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/routing
 */
import type { QueryClient } from '@tanstack/react-query'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { ReactNode } from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { Sidebar } from '~/components/Sidebar'
// `?url` asks Vite for the final URL of the file instead of injecting it.
// We then render it as a <link rel="stylesheet"> through head() below, so the
// CSS is in the server-rendered HTML (no flash of unstyled content).
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // head() returns tags for the document <head>. Child routes can add their
  // own; the deepest route's <title> wins. See /head-seo.
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TanStack Start — Feature Tour' },
      { name: 'description', content: 'Every TanStack Start feature in its own route.' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏝️</text></svg>' },
    ],
  }),
  errorComponent: (props) => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="layout">
          <Sidebar />
          <main className="content">{children}</main>
        </div>
        {/* Floating devtools panel (only included in development builds). */}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
