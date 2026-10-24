/**
 * REQUEST & RESPONSE UTILITIES — src/routes/request-response.tsx  →  "/request-response"
 * ============================================================================
 * Inside server code (server function handlers, middleware, server routes)
 * you can access the CURRENT HTTP request and shape the response with helpers
 * from '@tanstack/react-start/server'. They use AsyncLocalStorage under the
 * hood, so no need to pass `request` around.
 *
 * READ                               WRITE
 *   getRequest()          Request      setResponseStatus(201)
 *   getRequestHeader(n)                setResponseHeader(n, v) / setResponseHeaders({...})
 *   getRequestHeaders()                appendResponseHeader(n, v)
 *   getRequestUrl()                    setCookie(name, value, options)
 *   getRequestIP()                     deleteCookie(name, options)
 *   getRequestHost/Protocol()
 *   getCookie(name) / getCookies()
 *
 * ⚠️ Only call these inside a request (handler/middleware), never at module
 *    top level — there is no request then.
 * ⚠️ Use setCookie() for cookies, not setResponseHeader('Set-Cookie', …),
 *    which would overwrite other cookies.
 *
 * Routes can also set response headers declaratively with `headers()`
 * (see /isr).
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
 */
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  deleteCookie,
  getCookie,
  getRequestHeader,
  getRequestIP,
  getRequestUrl,
  setCookie,
  setResponseHeader,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { z } from 'zod'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'

const COOKIE = 'favorite-fruit'

const inspectRequest = createServerFn({ method: 'GET' }).handler(() => {
  setResponseHeader('x-inspected-at', new Date().toISOString())
  return {
    url: getRequestUrl().href,
    ip: getRequestIP({ xForwardedFor: true }) ?? 'unknown',
    userAgent: getRequestHeader('user-agent') ?? 'unknown',
    acceptLanguage: getRequestHeader('accept-language') ?? 'unknown',
    favoriteFruit: getCookie(COOKIE) ?? null,
  }
})

const saveFruit = createServerFn({ method: 'POST' })
  .validator(z.object({ fruit: z.string().max(20).nullable() }))
  .handler(({ data }) => {
    if (data.fruit === null) {
      deleteCookie(COOKIE, { path: '/' })
    } else {
      // httpOnly: JS in the browser can't read it — only the server can.
      setCookie(COOKIE, data.fruit, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 })
    }
    setResponseStatus(201) // custom status code for this response
    return { saved: data.fruit }
  })

export const Route = createFileRoute('/request-response')({
  loader: () => inspectRequest(),
  component: RequestResponsePage,
})

function RequestResponsePage() {
  const info = Route.useLoaderData()
  const router = useRouter()

  const save = async (fruit: string | null) => {
    await saveFruit({ data: { fruit } })
    await router.invalidate() // re-read the cookie via the loader
  }

  return (
    <FeaturePage
      title="Request & response utilities"
      file="src/routes/request-response.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/server-functions"
      intro={<p>Read headers &amp; cookies, set status codes, headers and cookies — from inside server functions.</p>}
    >
      <Demo title="What the server sees about your request">
        <Code>{JSON.stringify(info, null, 2)}</Code>
      </Demo>
      <Demo title="Set an httpOnly cookie from a server function">
        <div className="row">
          {['🥭 mango', '🍍 pineapple', '🥥 coconut'].map((fruit) => (
            <button key={fruit} onClick={() => save(fruit)}>
              {fruit}
            </button>
          ))}
          <button onClick={() => save(null)}>delete cookie</button>
        </div>
        <p className="muted">
          The cookie is <code>httpOnly</code>: <code>document.cookie</code> can&apos;t see it, but the loader reads it
          on the server. Reload the page — it persists. In DevTools → Network the POST responds with status{' '}
          <code>201</code>.
        </p>
      </Demo>
    </FeaturePage>
  )
}
