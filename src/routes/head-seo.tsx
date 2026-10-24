/**
 * HEAD & SEO — src/routes/head-seo.tsx  →  "/head-seo"
 * ============================================================================
 * Every route can define `head()`, returning tags for the document <head>:
 *   meta    → <title>, <meta name/property/content>, charset …
 *   links   → <link> (stylesheets, canonical, icons, preload …)
 *   scripts → <script> tags placed in <head>
 *   styles  → inline <style> tags
 *
 * Tags from all matched routes are MERGED (root → leaf). For duplicates such
 * as <title> or meta with the same name, the deepest route wins.
 * They are rendered by <HeadContent /> in __root.tsx — so they are in the
 * SERVER HTML, which is what search engines and link previews read.
 *
 * `head` receives `loaderData`, `params` and `match`, so titles can depend on
 * fetched data (see src/routes/path-params/$postId.tsx).
 *
 * There's also `scripts()` on a route (body scripts) and `headers()` for HTTP
 * response headers (see /isr).
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/seo
 */
import { createFileRoute } from '@tanstack/react-router'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'

export const Route = createFileRoute('/head-seo')({
  loader: () => ({
    product: { name: 'Island Hammock', price: 89, description: 'The comfiest hammock on any tropical island.' },
  }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name} — Head & SEO demo` },
      { name: 'description', content: loaderData?.product.description },
      // Open Graph / Twitter cards for link previews
      { property: 'og:title', content: loaderData?.product.name },
      { property: 'og:description', content: loaderData?.product.description },
      { property: 'og:type', content: 'product' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'index, follow' },
    ],
    links: [{ rel: 'canonical', href: 'https://example.com/head-seo' }],
    scripts: [
      // Structured data (JSON-LD) for rich search results
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: loaderData?.product.name,
          offers: { '@type': 'Offer', price: loaderData?.product.price, priceCurrency: 'USD' },
        }),
      },
    ],
    styles: [{ children: '.seo-highlight { outline: 2px solid var(--accent); padding: 0.25rem; }' }],
  }),
  component: HeadSeoPage,
})

function HeadSeoPage() {
  const { product } = Route.useLoaderData()
  return (
    <FeaturePage
      title="Head & SEO"
      file="src/routes/head-seo.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/seo"
      intro={
        <p>
          Look at the browser tab title, then <strong>View Page Source</strong> — the meta tags, canonical link and
          JSON-LD script are all in the server-rendered HTML.
        </p>
      }
    >
      <Demo title="Tags generated from loader data">
        <p className="seo-highlight">
          {product.name} — ${product.price}. (This outline comes from an inline <code>styles</code> entry in head().)
        </p>
        <Code>{`
head: ({ loaderData }) => ({
  meta: [
    { title: \`\${loaderData.product.name} — Head & SEO demo\` },
    { name: 'description', content: loaderData.product.description },
    { property: 'og:title', content: loaderData.product.name },
  ],
  links: [{ rel: 'canonical', href: 'https://example.com/head-seo' }],
  scripts: [{ type: 'application/ld+json', children: JSON.stringify({...}) }],
})
        `}</Code>
      </Demo>
    </FeaturePage>
  )
}
