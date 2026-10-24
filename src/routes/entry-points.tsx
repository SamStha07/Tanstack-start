/**
 * ENTRY POINTS & CONFIG — src/routes/entry-points.tsx  →  "/entry-points"
 * ============================================================================
 * The files that make up a TanStack Start app's "skeleton". Read them in
 * this order:
 *
 *  1. vite.config.ts        Vite + the tanstackStart() plugin (+ RSC, prerender)
 *  2. src/router.tsx        getRouter(): creates the router (+ QueryClient)
 *  3. src/routes/__root.tsx the HTML document shell (<HeadContent/>, <Scripts/>)
 *  4. src/start.ts          OPTIONAL global middleware & options (createStart)
 *  5. src/server.ts         OPTIONAL custom server entry (fetch handler)
 *  6. src/client.tsx        OPTIONAL custom client entry (hydrateRoot)
 *  7. src/routeTree.gen.ts  GENERATED — never edit; commit it so typecheck
 *                           works without running the dev server
 *
 * Request lifecycle on the server:
 *   HTTP request
 *     → src/server.ts fetch()
 *     → global request middleware (src/start.ts)
 *     → is it a server function (/_serverFn/…)?  run function middleware + handler
 *     → is it a server route (server.handlers)?  run route middleware + handler
 *     → otherwise SSR: getRouter(), match routes, beforeLoad → loaders,
 *       render __root.tsx + matched components, stream HTML
 *   Browser
 *     → src/client.tsx hydrateRoot(<StartClient/>) → SPA from here on
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/build-from-scratch
 */
import { createFileRoute } from '@tanstack/react-router'
import { Code, Explain, FeaturePage } from '~/components/FeaturePage'

export const Route = createFileRoute('/entry-points')({
  component: EntryPointsPage,
})

const files = [
  ['vite.config.ts', 'Registers tanstackStart() (must come before viteReact()), @vitejs/plugin-rsc and prerender settings.', 'required'],
  ['src/router.tsx', 'Exports getRouter(). Called per request on the server and once in the browser.', 'required'],
  ['src/routes/__root.tsx', 'Root route: renders <html>, <head><HeadContent/></head>, <body><Outlet/><Scripts/></body>.', 'required'],
  ['src/start.ts', 'createStart(): global request/function middleware (CSRF, logging, timing) and defaultSsr.', 'optional'],
  ['src/server.ts', 'createServerEntry({ fetch }): wraps every request. Here it adds an x-powered-by header.', 'optional'],
  ['src/client.tsx', 'hydrateRoot(document, <StartClient />): first code to run in the browser.', 'optional'],
  ['src/routeTree.gen.ts', 'Generated route tree with all the types. Regenerated on every dev/build run.', 'generated'],
] as const

function EntryPointsPage() {
  return (
    <FeaturePage
      title="Entry points & config"
      file="src/routes/entry-points.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/build-from-scratch"
      intro={<p>The handful of files that wire a TanStack Start app together. Open each one — they are all commented.</p>}
    >
      <table>
        <thead>
          <tr>
            <th>file</th>
            <th>what it does</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {files.map(([file, what, kind]) => (
            <tr key={file}>
              <td>
                <code>{file}</code>
              </td>
              <td>{what}</td>
              <td>
                <span className="pill">{kind}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Explain title="Request lifecycle">
        <Code>{`
HTTP request
  └─ src/server.ts  fetch(request)
       └─ global request middleware (src/start.ts)
            ├─ /_serverFn/…        → function middleware → server function handler
            ├─ server.handlers     → route middleware    → server route handler
            └─ page                → getRouter() → beforeLoad → loader → render
                                     __root.tsx + matched routes → stream HTML
Browser
  └─ src/client.tsx  hydrateRoot(document, <StartClient />)
       └─ client-side navigation from now on (loaders run in the browser,
          server functions become fetch calls)
        `}</Code>
      </Explain>

      <Explain title="Minimal vite.config.ts">
        <Code>{`
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [tanstackStart(), viteReact()],   // order matters!
})
        `}</Code>
      </Explain>

      <Explain title="Check the custom server entry">
        <Code>{`$ curl -I localhost:3000/entry-points
x-powered-by: TanStack Start (custom src/server.ts)`}</Code>
      </Explain>
    </FeaturePage>
  )
}
