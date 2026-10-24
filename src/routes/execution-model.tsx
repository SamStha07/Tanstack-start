/**
 * EXECUTION MODEL — src/routes/execution-model.tsx  →  "/execution-model"
 * ============================================================================
 * THE most important concept in TanStack Start:
 *
 *   ALL CODE IS ISOMORPHIC BY DEFAULT — it can run on the server AND in the
 *   browser. Components render on both. Loaders and beforeLoad run on the
 *   server for the first request, then in the browser.
 *
 * Tools to control where code runs:
 * ┌────────────────────────┬───────────────────────────┬─────────────────────────┐
 * │ API                    │ on the server              │ in the browser           │
 * ├────────────────────────┼───────────────────────────┼─────────────────────────┤
 * │ createServerFn()       │ runs                       │ fetch() to the server    │
 * │ createServerOnlyFn(fn) │ runs                       │ THROWS                   │
 * │ createClientOnlyFn(fn) │ THROWS                     │ runs                     │
 * │ createIsomorphicFn()   │ .server(impl)              │ .client(impl)            │
 * │   .server().client()   │                            │                          │
 * │ <ClientOnly>           │ renders fallback           │ renders children         │
 * │ useHydrated()          │ false                      │ true after hydration     │
 * │ *.server.ts files      │ importable                 │ import is an ERROR       │
 * │ *.client.ts files      │ import is an ERROR         │ importable               │
 * └────────────────────────┴───────────────────────────┴─────────────────────────┘
 *
 * The compiler REMOVES the wrong-side implementation from each bundle, so
 * server-only code (and its imports) never reaches the browser bundle.
 *
 * Common mistake: putting `db.query()` or `process.env.SECRET` directly in a
 * loader. It works on first load (server) and breaks/leaks on client
 * navigation. Wrap it in createServerFn.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/execution-model
 */
import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { createClientOnlyFn, createIsomorphicFn, createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Callout, Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { getSecretApiKey } from '~/server/secrets.server'

// One function, two implementations — the right one is picked per bundle.
const getRuntime = createIsomorphicFn()
  .server(() => `🖥️ server (Node ${process.version})`)
  .client(() => `🌐 browser (${navigator.userAgent.split(' ').at(-1)})`)

// Throws if called in the browser. Use for server-only helpers.
const readSecret = createServerOnlyFn(() => getSecretApiKey())

// Throws if called on the server. Use for browser-only helpers.
const readLocalStorage = createClientOnlyFn(() => {
  const visits = Number(localStorage.getItem('visits') ?? '0') + 1
  localStorage.setItem('visits', String(visits))
  return visits
})

// The RIGHT way to use a server-only helper from client code: wrap the call
// in a server function. Only a masked value leaves the server.
const getMaskedSecret = createServerFn({ method: 'GET' }).handler(() => {
  const secret = readSecret()
  return `${secret.slice(0, 6)}…(${secret.length} chars)`
})

export const Route = createFileRoute('/execution-model')({
  loader: async () => ({
    loaderRanOn: getRuntime(), // server on first load, browser on client nav
    masked: await getMaskedSecret(),
  }),
  component: ExecutionModelPage,
})

function ExecutionModelPage() {
  const { loaderRanOn, masked } = Route.useLoaderData()
  const [log, setLog] = useState<Array<string>>([])
  const add = (line: string) => setLog((prev) => [...prev, line])

  return (
    <FeaturePage
      title="Execution model: where does code run?"
      file="src/routes/execution-model.tsx (+ src/server/secrets.server.ts)"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/execution-model"
      intro={<p>Isomorphic by default — and precise tools to pin code to one side.</p>}
    >
      <Demo title="createIsomorphicFn">
        <p>
          The loader called <code>getRuntime()</code> on: <strong>{loaderRanOn}</strong>
        </p>
        <p className="muted">Reload → server. Navigate here from another page → browser.</p>
        <button onClick={() => add(`getRuntime() in a click handler → ${getRuntime()}`)}>call getRuntime() now</button>
      </Demo>

      <Demo title="createServerOnlyFn / createClientOnlyFn">
        <div className="row">
          <button
            onClick={() => {
              try {
                add(`readSecret() → ${readSecret()}`)
              } catch (e) {
                add(`readSecret() in browser THREW: ${e instanceof Error ? e.message : String(e)}`)
              }
            }}
          >
            call server-only fn in the browser
          </button>
          <button onClick={() => add(`readLocalStorage() → you clicked this ${readLocalStorage()} time(s) (stored in localStorage)`)}>
            call client-only fn
          </button>
        </div>
        <p>
          Through a server function instead: <code>{masked}</code>
        </p>
      </Demo>

      <Demo title="<ClientOnly>">
        <ClientOnly fallback={<p className="muted">Fallback rendered on the server (and during hydration)…</p>}>
          <p>
            ✅ Browser-only content. Window width: <strong>{typeof window !== 'undefined' ? window.innerWidth : '?'}px</strong>
          </p>
        </ClientOnly>
      </Demo>

      {log.length > 0 && <Code>{log.join('\n')}</Code>}

      <Callout kind="warning">
        Loaders are not server-only! The import of <code>secrets.server.ts</code> above is OK only because it is used
        inside <code>createServerOnlyFn</code>/<code>createServerFn</code>, which the compiler strips from the client
        bundle.
      </Callout>
    </FeaturePage>
  )
}
