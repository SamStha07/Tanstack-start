/**
 * GLOBAL START CONFIG — src/start.ts
 * ----------------------------------------------------------------------------
 * Optional file. When present, Start reads the `startInstance` export and uses
 * it to configure app-wide behaviour:
 *
 *   - requestMiddleware  → runs for EVERY server request (SSR page renders,
 *                          server routes AND server function calls).
 *   - functionMiddleware → runs for EVERY server function call.
 *   - defaultSsr         → change the default `ssr` option for all routes
 *                          (see /selective-ssr).
 *
 * IMPORTANT: once you define this file you must add CSRF protection yourself
 * (Start only adds it automatically when this file doesn't exist).
 *
 * See the /middleware route for a full walkthrough of middleware.
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/middleware
 */
import { createCsrfMiddleware, createStart } from '@tanstack/react-start'
import { requestLoggerMiddleware } from './middleware/logger'
import { functionTimingMiddleware } from './middleware/timing'

// Rejects server-function requests that cannot be proven same-origin
// (checks Sec-Fetch-Site / Origin / Referer headers).
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, requestLoggerMiddleware],
  functionMiddleware: [functionTimingMiddleware],
}))
