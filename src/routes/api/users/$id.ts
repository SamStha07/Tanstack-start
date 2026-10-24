/**
 * SERVER ROUTE with a path param + middleware — src/routes/api/users/$id.ts
 *   → GET "/api/users/:id"   DELETE "/api/users/:id" (needs a header)
 * ============================================================================
 * - Dynamic segments work exactly like page routes: `params.id`.
 * - `server.middleware` runs for ALL handlers of this route.
 * - `createHandlers` lets you attach middleware to a SINGLE handler.
 * - Server routes can share server-only code (db.server.ts) with server
 *   functions — never fetch your own API from a loader; call the shared code.
 *
 * Try:  curl localhost:3000/api/users/u1
 *       curl localhost:3000/api/users/nope          → 404
 *       curl -X DELETE localhost:3000/api/users/u1  → 401 (missing x-api-key)
 *       curl -X DELETE -H 'x-api-key: demo' localhost:3000/api/users/u1
 */
import { createFileRoute } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { db } from '~/server/db.server'

// Request middleware (server only). Adds a header to every response it wraps.
const corsMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next()
  result.response.headers.set('access-control-allow-origin', '*')
  return result
})

// Short-circuits with a 401 Response when the API key is missing.
const apiKeyMiddleware = createMiddleware().server(({ next, request }) => {
  if (request.headers.get('x-api-key') !== 'demo') {
    throw Response.json({ error: 'Missing or invalid x-api-key header' }, { status: 401 })
  }
  return next({ context: { apiKeyOwner: 'demo-client' } })
})

export const Route = createFileRoute('/api/users/$id')({
  server: {
    middleware: [corsMiddleware], // all handlers
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: ({ params }) => {
          const user = db.users.find((u) => u.id === params.id)
          if (!user) return Response.json({ error: `User ${params.id} not found` }, { status: 404 })
          // Never send the password field!
          const { password: _password, ...safeUser } = user
          return Response.json(safeUser)
        },
        DELETE: {
          middleware: [apiKeyMiddleware], // only this handler
          handler: ({ params, context }) => {
            // Demo only: we don't really delete the user.
            return Response.json({ wouldDelete: params.id, requestedBy: context.apiKeyOwner })
          },
        },
      }),
  },
})
