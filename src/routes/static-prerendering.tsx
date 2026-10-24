/**
 * STATIC PRERENDERING (SSG) — src/routes/static-prerendering.tsx
 *   →  "/static-prerendering"
 * ============================================================================
 * Prerendering = running SSR at BUILD time and saving the HTML to a file.
 * The server (or any static host / CDN) then serves that file directly.
 *
 * Configure it in vite.config.ts:
 *
 *   tanstackStart({
 *     prerender: {
 *       enabled: true,
 *       crawlLinks: true,          // follow <a href> in rendered pages
 *       autoStaticPathsDiscovery,  // prerender every route without params
 *       filter: ({ path }) => …,   // skip some
 *     },
 *     pages: [{ path: '/static-prerendering' }],   // explicit list
 *   })
 *
 * This project prerenders only a few pages (see vite.config.ts) because most
 * demos need a live server.
 *
 * Mix & match: prerendered pages still hydrate into a full SPA, and other
 * routes in the same app can stay dynamic. For "static but refresh every N
 * minutes", see /isr.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering
 */
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'

const getRenderInfo = createServerFn({ method: 'GET' }).handler(() => ({
  renderedAt: new Date().toISOString(),
}))

export const Route = createFileRoute('/static-prerendering')({
  loader: () => getRenderInfo(),
  component: PrerenderPage,
})

function PrerenderPage() {
  const { renderedAt } = Route.useLoaderData()
  return (
    <FeaturePage
      title="Static prerendering"
      file="src/routes/static-prerendering.tsx (+ vite.config.ts)"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering"
      intro={<p>HTML generated at build time.</p>}
    >
      <Demo title="When was this HTML rendered?">
        <p>
          <code>{renderedAt}</code>
        </p>
        <p className="muted">
          In dev this changes on every reload. After <code>npm run build &amp;&amp; npm start</code>, reload the page
          (a full reload, not a client navigation): the time stays fixed at the build time — the HTML comes from{' '}
          <code>dist/client/static-prerendering/index.html</code>.
        </p>
      </Demo>
      <Code>{`
// vite.config.ts
tanstackStart({
  prerender: { enabled: true, crawlLinks: false, autoStaticPathsDiscovery: false },
  pages: [{ path: '/static-prerendering' }, { path: '/static-server-functions' }],
})
      `}</Code>
    </FeaturePage>
  )
}
