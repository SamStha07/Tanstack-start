/**
 * MIDDLEWARE — src/routes/middleware.tsx  →  "/middleware"
 * ============================================================================
 * Middleware wraps server work with reusable logic: auth, logging, timing,
 * context injection, header manipulation …  Created with `createMiddleware`.
 *
 * TWO KINDS
 * ┌──────────────────────┬───────────────────────────┬───────────────────────────┐
 * │                      │ Request middleware         │ Function middleware        │
 * ├──────────────────────┼───────────────────────────┼───────────────────────────┤
 * │ create with          │ createMiddleware()         │ createMiddleware({ type:   │
 * │                      │                            │   'function' })            │
 * │ runs for             │ EVERY server request (SSR, │ server function calls only │
 * │                      │ server routes, server fns) │                            │
 * │ phases               │ .server()                  │ .client() + .server()      │
 * │ input validation     │ no                         │ .validator()               │
 * └──────────────────────┴───────────────────────────┴───────────────────────────┘
 *
 * WHERE TO ATTACH
 *   - Globally: src/start.ts → createStart({ requestMiddleware, functionMiddleware })
 *       (this app: CSRF + request logger + timing — see src/start.ts)
 *   - Per server function: createServerFn().middleware([a, b]).handler(...)
 *   - Per server route: server: { middleware: [a], handlers: {...} }
 *
 * HOW IT FLOWS: each middleware calls `next()` to run the rest of the chain
 * (like Express/Koa). Code before `next()` runs on the way in, code after it
 * on the way out. Pass `next({ context })` to add typed context.
 *
 * All the middleware used here lives in src/middleware/demo.ts.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/middleware
 */
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { useState } from 'react'
import { z } from 'zod'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { clientInfoMiddleware, logServerClockMiddleware, userAgentMiddleware } from '~/middleware/demo'

const whoAmI = createServerFn({ method: 'GET' })
  // Middleware run in order; their context is merged and fully typed.
  .middleware([userAgentMiddleware, clientInfoMiddleware, logServerClockMiddleware])
  .validator(z.object({ shout: z.boolean() }))
  .handler(({ context, data }) => {
    const greeting = `Hello from request ${context.requestId}!`
    return {
      greeting: data.shout ? greeting.toUpperCase() : greeting,
      // ↓ all of these were put into `context` by middleware
      requestId: context.requestId,
      userAgent: context.userAgent.slice(0, 60),
      clientTimeZone: context.clientTimeZone,
      demoHeader: getRequestHeader('x-demo-header') ?? null,
    }
  })

export const Route = createFileRoute('/middleware')({
  component: MiddlewarePage,
})

function MiddlewarePage() {
  const [result, setResult] = useState<Awaited<ReturnType<typeof whoAmI>> | null>(null)
  return (
    <FeaturePage
      title="Middleware"
      file="src/routes/middleware.tsx (+ src/middleware/*.ts, src/start.ts)"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/middleware"
      intro={<p>Composable logic around server functions and requests, with typed context.</p>}
    >
      <Demo title="Call a server function with 3 middleware attached">
        <div className="row">
          <button onClick={async () => setResult(await whoAmI({ data: { shout: false } }))}>whoAmI()</button>
          <button onClick={async () => setResult(await whoAmI({ data: { shout: true } }))}>whoAmI({'{ shout: true }'})</button>
        </div>
        {result && <Code>{JSON.stringify(result, null, 2)}</Code>}
        <p className="muted">
          Also check the <strong>browser console</strong> (client-phase logs: round-trip time, server clock) and the{' '}
          <strong>terminal</strong> (server-phase logs: request logger, handler time, user agent).
        </p>
      </Demo>

      <Demo title="Execution order for one whoAmI() call from the browser">
        <Code>{`
BROWSER                                   SERVER
functionTimingMiddleware.client  (global)
clientInfoMiddleware.client  → sendContext { timeZone } + header
logServerClockMiddleware.client  ── await next() ──┐
                                                    │  csrfMiddleware            (global request mw)
                                                    │  requestLoggerMiddleware   (global request mw)
                                                    │  functionTimingMiddleware.server (global fn mw)
                                                    │  requestIdMiddleware.server  → context.requestId
                                                    │  userAgentMiddleware.server  → context.userAgent
                                                    │  clientInfoMiddleware.server → context.clientTimeZone
                                                    │  serverClockMiddleware.server→ sendContext { serverClock }
                                                    │  validator → handler
logServerClockMiddleware.client  ◄── result ───────┘   (reads result.context.serverClock)
        `}</Code>
      </Demo>

      <Code>{`
const authMiddleware = createMiddleware({ type: 'function' })
  .server(async ({ next }) => {
    const user = await getUserFromCookie()
    if (!user) throw new Error('Unauthorized')
    return next({ context: { user } })     // ← typed context for the handler
  })

const getSecret = createServerFn()
  .middleware([authMiddleware])
  .handler(({ context }) => \`hi \${context.user.name}\`)
      `}</Code>
    </FeaturePage>
  )
}
