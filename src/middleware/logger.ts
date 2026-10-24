/**
 * REQUEST MIDDLEWARE — created with `createMiddleware()` (no type option).
 *
 * Request middleware only has a `.server()` phase and runs for every request
 * that hits the server: SSR, server routes and server functions.
 * It is registered globally in src/start.ts.
 *
 * `next()` runs the rest of the chain and returns the result (which contains
 * the Response) so you can inspect / modify it afterwards.
 */
import { createMiddleware } from '@tanstack/react-start'

export const requestLoggerMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const start = Date.now()
    const result = await next()
    const url = new URL(request.url)
    // Skip noisy Vite dev asset requests.
    if (!url.pathname.startsWith('/@') && !url.pathname.includes('.')) {
      console.log(`[request] ${request.method} ${url.pathname} — ${Date.now() - start}ms`)
    }
    return result
  },
)
