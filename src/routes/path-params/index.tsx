/**
 * PATH PARAMS — src/routes/path-params/index.tsx  →  "/path-params"
 * ============================================================================
 * Dynamic URL segments are written with a `$` prefix in the file name:
 *
 *   src/routes/path-params/$postId.tsx      → /path-params/1, /path-params/abc …
 *   src/routes/path-params/files.$.tsx      → /path-params/files/<anything/at/all>
 *   src/routes/path-params/{-$lang}.about.tsx → /path-params/about  AND
 *                                               /path-params/fr/about
 *
 * When linking to a dynamic route you pass `params` — and TypeScript forces
 * you to pass the right ones:
 *
 *   <Link to="/path-params/$postId" params={{ postId: '1' }} />
 *
 * Inside the route you read them with `Route.useParams()` (component) or the
 * `params` argument (loader / beforeLoad). Params are always strings unless
 * you add a `params.parse` function.
 */
import { Link, createFileRoute } from '@tanstack/react-router'
import { Code, Demo, Explain, FeaturePage } from '~/components/FeaturePage'
import { getPosts } from '~/utils/posts.functions'

export const Route = createFileRoute('/path-params/')({
  loader: () => getPosts(),
  component: PathParamsIndex,
})

function PathParamsIndex() {
  const posts = Route.useLoaderData()
  return (
    <FeaturePage
      title="Path params"
      file="src/routes/path-params/"
      docs="https://tanstack.com/router/latest/docs/framework/react/guide/path-params"
      intro={<p>Dynamic segments in the URL, fully typed from the file name.</p>}
    >
      <Demo title="Dynamic param: $postId">
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              {/* `params` is REQUIRED and type-checked because the route has $postId */}
              <Link to="/path-params/$postId" params={{ postId: post.id }}>
                /path-params/{post.id} — {post.title}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/path-params/$postId" params={{ postId: '999' }}>
              /path-params/999 (does not exist → notFound())
            </Link>
          </li>
        </ul>
      </Demo>

      <Demo title="Splat / catch-all param: $">
        <ul>
          <li>
            <Link to="/path-params/files/$" params={{ _splat: 'docs/2026/report.pdf' }}>
              /path-params/files/docs/2026/report.pdf
            </Link>
          </li>
          <li>
            <Link to="/path-params/files/$" params={{ _splat: 'a/b/c/d/e' }}>
              /path-params/files/a/b/c/d/e
            </Link>
          </li>
        </ul>
      </Demo>

      <Demo title="Optional param: {-$lang}">
        <ul>
          <li>
            <Link to="/path-params/{-$lang}/about" params={{ lang: undefined }}>
              /path-params/about
            </Link>
          </li>
          <li>
            <Link to="/path-params/{-$lang}/about" params={{ lang: 'fr' }}>
              /path-params/fr/about
            </Link>
          </li>
        </ul>
      </Demo>

      <Explain title="File names → URLs">
        <Code>{`
path-params/index.tsx            /path-params
path-params/$postId.tsx          /path-params/:postId
path-params/files.$.tsx          /path-params/files/*       params._splat
path-params/{-$lang}.about.tsx   /path-params/[:lang]/about params.lang?: string
        `}</Code>
      </Explain>
    </FeaturePage>
  )
}
