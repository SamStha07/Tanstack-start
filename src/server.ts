/**
 * CUSTOM SERVER ENTRY — src/server.ts   (optional file)
 * ----------------------------------------------------------------------------
 * Start auto-detects this file. Its default export must have a `fetch(request)`
 * method (the universal "fetch handler" format used by Cloudflare Workers,
 * Bun, Deno, srvx, Nitro …). Every HTTP request — page renders, server
 * functions, server routes — goes through here.
 *
 * Here we just delegate to Start's built-in handler and add a response header
 * so you can see the entry is active (look for `x-powered-by` in DevTools →
 * Network). Delete this file and Start falls back to its default entry.
 *
 * See /entry-points for the full explanation.
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point
 */
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

export default createServerEntry({
  async fetch(request, opts) {
    const response = await handler.fetch(request, opts)
    // Copy into a new Response: some responses (e.g. redirects) have
    // immutable headers.
    const headers = new Headers(response.headers)
    headers.set('x-powered-by', 'TanStack Start (custom src/server.ts)')
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
})
