/**
 * LOW-LEVEL FLIGHT STREAM — src/routes/api/rsc.tsx  →  GET "/api/rsc"
 * ============================================================================
 * For custom transports you can produce a raw React Flight stream with
 * `renderToReadableStream` (inside a server function) and return it from a
 * server route. A client can decode it with `createFromFetch(fetch('/api/rsc'))`.
 *
 * You rarely need this — prefer renderServerComponent / createCompositeComponent.
 * Try:  curl localhost:3000/api/rsc   (you'll see the Flight wire format)
 */
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { renderToReadableStream } from '@tanstack/react-start/rsc'

const getFlightStream = createServerFn({ method: 'GET' }).handler(() =>
  renderToReadableStream(
    <p>
      Raw Flight stream rendered at <strong>{new Date().toLocaleTimeString()}</strong>
    </p>,
  ),
)

export const Route = createFileRoute('/api/rsc')({
  server: {
    handlers: {
      GET: async () => new Response(await getFlightStream(), { headers: { 'content-type': 'text/x-component' } }),
    },
  },
})
