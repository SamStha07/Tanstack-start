/**
 * SPA MODE — src/routes/spa-mode.tsx  →  "/spa-mode"
 * ============================================================================
 * SPA mode turns TanStack Start into a client-rendered single-page app:
 * NO server rendering of pages at all. At build time Start prerenders one
 * "shell" HTML file (just the root route, with pendingComponent / fallback)
 * that a static host serves for every URL. Everything else renders in the
 * browser.
 *
 *   // vite.config.ts
 *   tanstackStart({
 *     spa: {
 *       enabled: true,
 *       // optional: where the shell is written / what it contains
 *       prerender: { outputPath: '/_shell.html', crawlLinks: false },
 *     },
 *   })
 *
 * You keep: file-based routing, type-safe links, server functions & server
 * routes (if you also deploy the server part), middleware…
 * You lose: SEO-friendly HTML, fast first paint with data, streaming.
 *
 * In SPA mode loaders always run in the browser, so server-only work must
 * (as always) go through server functions.
 *
 * Want SPA behaviour for SOME routes only? Use Selective SSR instead:
 * `ssr: false` on a route (see /selective-ssr), or `defaultSsr: false` in
 * src/start.ts to flip the default for the whole app.
 *
 * This project does NOT enable SPA mode (it would turn off SSR for every
 * other demo), so this page only documents it.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode
 */
import { createFileRoute } from '@tanstack/react-router'
import { Code, Explain, FeaturePage } from '~/components/FeaturePage'

export const Route = createFileRoute('/spa-mode')({
  component: SpaModePage,
})

function SpaModePage() {
  return (
    <FeaturePage
      title="SPA mode"
      file="src/routes/spa-mode.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode"
      intro={<p>Disable server-side rendering for the whole app and ship a static shell.</p>}
    >
      <Explain title="Turning it on">
        <Code>{`
// vite.config.ts
tanstackStart({
  spa: { enabled: true },
})
        `}</Code>
      </Explain>
      <Explain title="Compared to the other rendering options">
        <table>
          <thead>
            <tr>
              <th>Mode</th>
              <th>Server renders HTML?</th>
              <th>Loaders run on</th>
              <th>Where configured</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SSR (default)</td>
              <td>yes, per request</td>
              <td>server first, then browser</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Selective SSR</td>
              <td>per route</td>
              <td>per route</td>
              <td>
                route <code>ssr</code> option / <code>defaultSsr</code>
              </td>
            </tr>
            <tr>
              <td>Prerendering (SSG)</td>
              <td>yes, at build time</td>
              <td>build, then browser</td>
              <td>
                <code>prerender</code> in vite.config.ts
              </td>
            </tr>
            <tr>
              <td>SPA mode</td>
              <td>only a static shell</td>
              <td>browser only</td>
              <td>
                <code>spa</code> in vite.config.ts
              </td>
            </tr>
          </tbody>
        </table>
      </Explain>
    </FeaturePage>
  )
}
