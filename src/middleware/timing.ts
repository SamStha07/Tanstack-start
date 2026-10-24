/**
 * SERVER FUNCTION MIDDLEWARE — created with `createMiddleware({ type: 'function' })`.
 *
 * Function middleware can have BOTH phases:
 *   - `.client()` runs in the browser before the RPC request is sent and after
 *     the response arrives (during SSR it runs on the server instead, because
 *     the "caller" is the server).
 *   - `.server()` runs on the server around the actual handler.
 *
 * Registered globally in src/start.ts, so it wraps every server function in
 * the app. Open the browser console and the terminal to see both logs.
 */
import { createMiddleware } from '@tanstack/react-start'

export const functionTimingMiddleware = createMiddleware({ type: 'function' })
  .client(async ({ next }) => {
    const start = Date.now()
    const result = await next() // ← the network request happens inside next()
    console.debug(`[server fn] round trip: ${Date.now() - start}ms`)
    return result
  })
  .server(async ({ next }) => {
    const start = Date.now()
    const result = await next() // ← the handler runs inside next()
    console.log(`[server fn] handler: ${Date.now() - start}ms`)
    return result
  })
