/**
 * ENVIRONMENT VARIABLES — src/routes/environment-variables.tsx  →  "/environment-variables"
 * ============================================================================
 * Two worlds:
 *
 *   import.meta.env.VITE_*   → inlined into the CLIENT bundle at build time.
 *                              PUBLIC. Anyone can read them. Use for things
 *                              like a public API URL or app name.
 *   process.env.*            → SERVER only (server functions, server routes,
 *                              middleware). Use for secrets: DB URLs, API keys.
 *                              Read them inside handlers, not at module scope.
 *
 * Built-ins: import.meta.env.DEV / PROD / MODE / SSR.
 *
 * Files: put them in `.env` (git-ignored here) at the project root:
 *     VITE_APP_NAME="My Island App"
 *     SECRET_API_KEY="sk-live-123"
 * `.env.local`, `.env.development`, `.env.production` are also loaded by Vite.
 * There's an `.env.example` in this repo you can copy.
 *
 * Types: declare your variables in src/vite-env.d.ts (ImportMetaEnv).
 *
 * Need a server value that isn't VITE_-prefixed on the client? Return it from
 * a server function (only if it's safe to expose!).
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables
 */
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Callout, Code, Demo, FeaturePage } from '~/components/FeaturePage'

const getServerEnv = createServerFn({ method: 'GET' }).handler(() => ({
  // Read inside the handler (per request), never at the top of the module.
  nodeEnv: process.env.NODE_ENV ?? 'undefined',
  hasSecretApiKey: Boolean(process.env.SECRET_API_KEY),
  // ✗ never return the secret itself!
}))

export const Route = createFileRoute('/environment-variables')({
  loader: () => getServerEnv(),
  component: EnvPage,
})

function EnvPage() {
  const server = Route.useLoaderData()
  const client = {
    'import.meta.env.VITE_APP_NAME': import.meta.env.VITE_APP_NAME ?? '(not set — add it to .env)',
    'import.meta.env.MODE': import.meta.env.MODE,
    'import.meta.env.DEV': import.meta.env.DEV,
    'import.meta.env.PROD': import.meta.env.PROD,
  }
  return (
    <FeaturePage
      title="Environment variables"
      file="src/routes/environment-variables.tsx (+ .env.example, src/vite-env.d.ts)"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables"
      intro={<p>Public VITE_ variables in the browser, secrets on the server.</p>}
    >
      <Demo title="Visible in the browser bundle">
        <Code>{JSON.stringify(client, null, 2)}</Code>
      </Demo>
      <Demo title="Read on the server (via a server function)">
        <Code>{JSON.stringify(server, null, 2)}</Code>
      </Demo>
      <Callout kind="warning">
        Never prefix a secret with <code>VITE_</code> — it will be embedded in the JavaScript sent to every visitor.
      </Callout>
    </FeaturePage>
  )
}
