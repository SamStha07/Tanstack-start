/**
 * STATIC SERVER FUNCTIONS — src/routes/static-server-functions.tsx  (experimental)
 *   →  "/static-server-functions"
 * ============================================================================
 * Add `staticFunctionMiddleware` (from @tanstack/start-static-server-functions)
 * as the LAST middleware of a GET server function and, when the page is
 * PRERENDERED at build time:
 *
 *   build time → the function runs once per distinct input; its result is
 *                written to a static JSON file in the build output.
 *   runtime    → the prerendered HTML already contains the data; later
 *                client-side calls fetch the static JSON file instead of
 *                hitting your server. Zero server work at runtime.
 *
 * Perfect for content that changes only when you deploy: docs, blog posts,
 * changelogs, marketing pages …
 *
 * This route is listed in `prerender.pages` in vite.config.ts.
 * In `npm run dev` there is no build step, so it behaves like a normal
 * server function (the timestamp changes on every reload). Run
 * `npm run build && npm start` and the timestamp is frozen at build time.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions
 */
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions'
import { Callout, Code, Demo, FeaturePage } from '~/components/FeaturePage'

const getBuildInfo = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware]) // must be the final middleware
  .handler(() => ({
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    note: 'If this timestamp never changes after `npm run build`, it came from a static JSON file.',
  }))

export const Route = createFileRoute('/static-server-functions')({
  loader: () => getBuildInfo(),
  component: StaticServerFunctionsPage,
})

function StaticServerFunctionsPage() {
  const info = Route.useLoaderData()
  return (
    <FeaturePage
      title="Static server functions"
      file="src/routes/static-server-functions.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions"
      intro={<p>Server functions executed at build time and served as static JSON afterwards.</p>}
    >
      <Demo title="Result of a static server function">
        <Code>{JSON.stringify(info, null, 2)}</Code>
      </Demo>
      <Callout kind="warning">Experimental API. Only meaningful for prerendered pages.</Callout>
      <Code>{`
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions'

const getBuildInfo = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])   // ← last!
  .handler(() => ({ generatedAt: new Date().toISOString() }))
      `}</Code>
    </FeaturePage>
  )
}
