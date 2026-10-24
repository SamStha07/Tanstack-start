/**
 * ISR & CACHE HEADERS — src/routes/isr.tsx  →  "/isr"
 * ============================================================================
 * Incremental Static Regeneration in TanStack Start is just HTTP caching:
 * set `Cache-Control` and let your CDN (Cloudflare, Netlify, Vercel …) do the
 * work.
 *
 *   headers: () => ({
 *     'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
 *   })
 *
 *   max-age=60                  browsers may reuse the page for 60s
 *   s-maxage=3600               CDNs may reuse it for 1h
 *   stale-while-revalidate=…    after that, serve the stale copy instantly
 *                               while regenerating in the background
 *
 * The route `headers()` option sets HTTP response headers for the document
 * request (it receives loaderData, params, etc.). Server functions can set
 * their own headers with setResponseHeader() — e.g. to cache GET data.
 *
 * ⚠️ Only use `public` for responses that are identical for every visitor.
 *    Anything personalized must be `private` or `no-store`, or one user's
 *    page could be served to another!
 *
 * Locally there's no CDN, so check the header in DevTools or with:
 *    curl -I localhost:3000/isr
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/isr
 */
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { Callout, Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { db } from '~/server/db.server'

const getPopularPosts = createServerFn({ method: 'GET' }).handler(() => {
  // Data-level caching: the RPC response for this GET server function can be
  // cached too (useful for client-side navigations).
  setResponseHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
  return {
    posts: [...db.posts].sort((a, b) => b.likes - a.likes).map(({ id, title, likes }) => ({ id, title, likes })),
    generatedAt: new Date().toISOString(),
  }
})

export const Route = createFileRoute('/isr')({
  loader: () => getPopularPosts(),
  // Page-level caching for the HTML document
  headers: () => ({
    'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
  }),
  component: IsrPage,
})

function IsrPage() {
  const { posts, generatedAt } = Route.useLoaderData()
  return (
    <FeaturePage
      title="ISR & cache headers"
      file="src/routes/isr.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/isr"
      intro={<p>Static-like performance with periodic freshness, using standard HTTP caching.</p>}
    >
      <Demo title="A cacheable page">
        <p className="muted">Generated at {generatedAt}</p>
        <ol>
          {posts.map((p) => (
            <li key={p.id}>
              {p.title} — {p.likes} ❤
            </li>
          ))}
        </ol>
        <Code>{`$ curl -I localhost:3000/isr
cache-control: public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`}</Code>
      </Demo>
      <Callout kind="warning">
        Never mark personalized pages <code>public</code>. Compare with <code>/tanstack-query</code>, which sends{' '}
        <code>private, no-store</code>.
      </Callout>
    </FeaturePage>
  )
}
