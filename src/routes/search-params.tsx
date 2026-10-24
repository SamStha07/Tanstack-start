/**
 * SEARCH PARAMS — src/routes/search-params.tsx  →  "/search-params?…"
 * ============================================================================
 * TanStack Router treats the query string as first-class, TYPED state.
 *
 * 1. `validateSearch` parses the raw query object. Here we pass a zod schema
 *    (Standard Schema — zod/valibot/arktype work directly). `.catch()` and
 *    `.default()` provide fallbacks, so bad or missing values never crash.
 * 2. Read it with `Route.useSearch()` — the result is fully typed.
 * 3. Write it with `<Link search={...}>` or `navigate({ search })`. Pass a
 *    function `(prev) => next` to update only some keys.
 * 4. `loaderDeps` lets the loader depend on search params. The loader re-runs
 *    and caches results PER deps value (see /loaders).
 *
 * Search params can be numbers, booleans, arrays and objects — they are
 * JSON-serialized into the URL for you.
 *
 * On the first (server) request, if the URL differs from the validated
 * result, Start answers with a 307 redirect to the canonical URL. Try
 * `curl -I "localhost:3000/search-params?page=banana"`.
 *
 * Docs: https://tanstack.com/router/latest/docs/framework/react/guide/search-params
 */
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Code, Demo, Explain, FeaturePage } from '~/components/FeaturePage'

const fruits = ['apple', 'banana', 'cherry', 'dragonfruit', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine']

// .catch(x)   → use x when the value in the URL is INVALID (?page=banana)
// .default(x) → use x when the value is MISSING; this also makes the param
//               optional when linking: <Link to="/search-params"> needs no `search`.
const searchSchema = z.object({
  q: z.string().catch('').default(''),
  page: z.number().int().min(1).catch(1).default(1),
  sort: z.enum(['asc', 'desc']).catch('asc').default('asc'),
  tags: z.array(z.string()).catch([]).default([]),
})

export const Route = createFileRoute('/search-params')({
  validateSearch: searchSchema,
  // Only the keys returned here become part of the loader's cache key.
  loaderDeps: ({ search }) => ({ q: search.q, sort: search.sort }),
  loader: ({ deps }) => {
    const filtered = fruits.filter((f) => f.includes(deps.q.toLowerCase()))
    return deps.sort === 'asc' ? filtered.sort() : filtered.sort().reverse()
  },
  component: SearchParamsPage,
})

const PAGE_SIZE = 4

function SearchParamsPage() {
  const search = Route.useSearch() // { q: string; page: number; sort: 'asc' | 'desc'; tags: string[] }
  const results = Route.useLoaderData()
  // `from` makes navigate() type-check search params against THIS route.
  const navigate = useNavigate({ from: Route.fullPath })

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const visible = results.slice((search.page - 1) * PAGE_SIZE, search.page * PAGE_SIZE)

  return (
    <FeaturePage
      title="Search params"
      file="src/routes/search-params.tsx"
      docs="https://tanstack.com/router/latest/docs/framework/react/guide/search-params"
      intro={<p>Typed, validated URL state. Every control below only changes the URL — the UI is derived from it.</p>}
    >
      <Demo title="A filterable, sortable, paginated list driven 100% by the URL">
        <div className="row">
          <input
            placeholder="filter fruits…"
            value={search.q}
            // replace: true → don't create a history entry for every keystroke
            onChange={(e) => navigate({ search: (prev) => ({ ...prev, q: e.target.value, page: 1 }), replace: true })}
          />
          <Link from={Route.fullPath} search={(prev) => ({ ...prev, sort: prev.sort === 'asc' ? 'desc' : 'asc' })}>
            sort: {search.sort} ⇅
          </Link>
          {['sweet', 'sour'].map((tag) => (
            <label key={tag}>
              <input
                type="checkbox"
                checked={search.tags.includes(tag)}
                onChange={(e) =>
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      tags: e.target.checked ? [...prev.tags, tag] : prev.tags.filter((t) => t !== tag),
                    }),
                  })
                }
              />{' '}
              {tag}
            </label>
          ))}
        </div>
        <ul>
          {visible.map((f) => (
            <li key={f}>{f}</li>
          ))}
          {visible.length === 0 && <li className="muted">no results</li>}
        </ul>
        <div className="row">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              from={Route.fullPath}
              search={(prev) => ({ ...prev, page: p })}
              activeOptions={{ includeSearch: true }}
              style={{ fontWeight: p === search.page ? 700 : 400 }}
            >
              page {p}
            </Link>
          ))}
        </div>
        <p className="muted">Current validated search object:</p>
        <Code>{JSON.stringify(search, null, 2)}</Code>
        <div className="row">
          <a href="/search-params?page=banana&sort=sideways">Try an invalid URL (page=banana&amp;sort=sideways)</a> →
          the schema&apos;s <code>.catch()</code> defaults kick in.
        </div>
      </Demo>

      <Explain title="The key pieces">
        <Code>{`
export const Route = createFileRoute('/search-params')({
  validateSearch: z.object({
    q: z.string().catch('').default(''),
    page: z.number().int().min(1).catch(1).default(1),
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => fetchStuff(deps.q),
})

// read
const { q, page } = Route.useSearch()
// write
<Link to="/search-params" search={{ q: 'kiwi', page: 1 }} />
navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })
        `}</Code>
      </Explain>
    </FeaturePage>
  )
}
