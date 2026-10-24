/**
 * SERVER ROUTE — src/routes/api/hello.ts  →  GET/POST "/api/hello"
 * ============================================================================
 * A server route is a raw HTTP endpoint. It's a normal file route with a
 * `server.handlers` object instead of (or in addition to) a component.
 * Handlers receive `{ request, params, context }` and return a standard
 * web `Response`.
 *
 * Try:  curl localhost:3000/api/hello
 *       curl "localhost:3000/api/hello?name=Sam"
 *       curl -X POST -H 'content-type: application/json' -d '{"name":"Sam"}' localhost:3000/api/hello
 *
 * Note the `.ts` extension: no JSX needed. Any folder works — "api/" is just
 * a convention.
 */
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const bodySchema = z.object({ name: z.string().min(1).max(50) })

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const name = new URL(request.url).searchParams.get('name') ?? 'world'
        return Response.json({ message: `Hello, ${name}!`, method: 'GET', at: new Date().toISOString() })
      },
      POST: async ({ request }) => {
        // Always validate request bodies — this is a public endpoint.
        const parsed = bodySchema.safeParse(await request.json().catch(() => null))
        if (!parsed.success) {
          return Response.json({ error: 'Expected JSON body { "name": string }' }, { status: 400 })
        }
        return Response.json({ message: `Hello, ${parsed.data.name}!`, method: 'POST' }, { status: 201 })
      },
    },
  },
})
