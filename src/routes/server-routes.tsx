/**
 * SERVER ROUTES (API) — src/routes/server-routes.tsx  →  "/server-routes"
 * ============================================================================
 * Server routes are raw HTTP endpoints defined with the `server` option of
 * `createFileRoute`. They live in src/routes next to your pages and follow the
 * same file-naming rules (params, splats …).
 *
 *   export const Route = createFileRoute('/api/hello')({
 *     server: {
 *       middleware: [...],                 // optional
 *       handlers: {
 *         GET:  ({ request, params, context }) => Response.json({...}),
 *         POST: async ({ request }) => new Response('created', { status: 201 }),
 *       },
 *     },
 *   })
 *
 * WHEN TO USE WHICH?
 *   server function  → data for YOUR app's UI (type-safe RPC, no URL design)
 *   server route     → a public HTTP contract: webhooks, REST API for other
 *                      clients, RSS feeds, file downloads, OAuth callbacks …
 *
 * A file can have BOTH a `server` and a `component`: this very file does —
 * POST /server-routes is handled below while GET renders the page.
 *
 * The endpoints demoed here:
 *   src/routes/api/hello.ts        GET / POST  /api/hello
 *   src/routes/api/users/$id.ts    GET / DELETE /api/users/:id
 *   src/routes/api/rsc.tsx         GET /api/rsc (a Flight stream, see RSC pages)
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
 */
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'

export const Route = createFileRoute('/server-routes')({
  // Same URL, two personalities: POST is handled by this server handler,
  // GET falls through to normal page rendering (component below).
  server: {
    handlers: {
      POST: async ({ request }) => {
        const text = await request.text()
        return new Response(`You POSTed ${text.length} characters to the page URL itself.`, {
          headers: { 'content-type': 'text/plain' },
        })
      },
    },
  },
  component: ServerRoutesPage,
})

function ServerRoutesPage() {
  const [output, setOutput] = useState('')

  // Relative fetch is fine here: this runs in a click handler (browser only).
  async function call(input: string, init?: RequestInit) {
    const res = await fetch(input, init)
    const body = await res.text()
    setOutput(`${init?.method ?? 'GET'} ${input}\n→ ${res.status} ${res.statusText}\n\n${body}`)
  }

  return (
    <FeaturePage
      title="Server routes (API endpoints)"
      file="src/routes/server-routes.tsx (+ src/routes/api/*)"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/server-routes"
      intro={<p>Plain HTTP handlers living right next to your pages.</p>}
    >
      <Demo title="Call the endpoints">
        <div className="row">
          <button onClick={() => call('/api/hello?name=Learner')}>GET /api/hello</button>
          <button onClick={() => call('/api/hello', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Poster' }) })}>
            POST /api/hello
          </button>
          <button onClick={() => call('/api/hello', { method: 'POST', body: 'not json' })}>POST invalid body</button>
        </div>
        <div className="row">
          <button onClick={() => call('/api/users/u1')}>GET /api/users/u1</button>
          <button onClick={() => call('/api/users/nope')}>GET /api/users/nope</button>
          <button onClick={() => call('/api/users/u1', { method: 'DELETE' })}>DELETE (no key)</button>
          <button onClick={() => call('/api/users/u1', { method: 'DELETE', headers: { 'x-api-key': 'demo' } })}>DELETE (with key)</button>
        </div>
        <div className="row">
          <button onClick={() => call('/server-routes', { method: 'POST', body: 'hello page' })}>POST /server-routes (this page)</button>
        </div>
        {output && <Code>{output}</Code>}
      </Demo>
      <Code>{`
// src/routes/api/hello.ts
export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: ({ request }) => Response.json({ message: 'Hello!' }),
    },
  },
})
      `}</Code>
    </FeaturePage>
  )
}
