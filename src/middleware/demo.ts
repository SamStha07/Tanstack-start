/**
 * Middleware used by src/routes/middleware.tsx. Read that file first.
 *
 * Method order is enforced by TypeScript:
 *   createMiddleware({ type: 'function' })
 *     .middleware([...deps])   // run these first; their context is inherited
 *     .validator(schema)       // validate the server fn's input
 *     .client(fn)              // browser side (before/after the RPC)
 *     .server(fn)              // server side (before/after the handler)
 */
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

/**
 * 1. A REQUEST-style server-only middleware that adds `requestId` to context.
 *    `next({ context })` merges new keys into the context for everything that
 *    runs after it (other middleware + the handler).
 */
export const requestIdMiddleware = createMiddleware({ type: 'function' }).server(({ next }) => {
  return next({ context: { requestId: crypto.randomUUID().slice(0, 8) } })
})

/**
 * 2. A middleware that DEPENDS on another one. It can read `requestId`
 *    (typed!) because requestIdMiddleware runs first.
 */
export const userAgentMiddleware = createMiddleware({ type: 'function' })
  .middleware([requestIdMiddleware])
  .server(({ next, context }) => {
    const userAgent = getRequestHeader('user-agent') ?? 'unknown'
    console.log(`[middleware] request ${context.requestId} from ${userAgent.slice(0, 40)}`)
    return next({ context: { userAgent } })
  })

/**
 * 3. CLIENT → SERVER context. The `.client()` phase runs in the browser and
 *    can attach data with `sendContext`; the `.server()` phase receives it in
 *    `context`. ⚠️ It comes from the client, so treat it as untrusted input.
 *    It can also add HTTP headers to the RPC request.
 */
export const clientInfoMiddleware = createMiddleware({ type: 'function' })
  .client(({ next }) => {
    const timeZone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'server-side-call'
    return next({
      sendContext: { timeZone },
      headers: { 'x-demo-header': 'set-by-client-middleware' },
    })
  })
  .server(({ next, context }) => {
    // Validate untrusted client data before using it.
    const timeZone = typeof context.timeZone === 'string' ? context.timeZone.slice(0, 64) : 'invalid'
    return next({ context: { clientTimeZone: timeZone } })
  })

/**
 * 4. SERVER → CLIENT context. `sendContext` returned from `.server()` travels
 *    back and is readable in `.client()` after `await next()`.
 */
export const serverClockMiddleware = createMiddleware({ type: 'function' })
  .server(({ next }) => next({ sendContext: { serverClock: new Date().toISOString() } }))

export const logServerClockMiddleware = createMiddleware({ type: 'function' })
  .middleware([serverClockMiddleware])
  .client(async ({ next }) => {
    const result = await next()
    console.log('[middleware] server clock sent back to the client:', result.context.serverClock)
    return result
  })
