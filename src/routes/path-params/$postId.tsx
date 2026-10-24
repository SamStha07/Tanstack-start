/**
 * src/routes/path-params/$postId.tsx  →  "/path-params/:postId"
 *
 * - `params.postId` is available (typed!) in loader, beforeLoad, head and via
 *   `Route.useParams()` in the component.
 * - `params.parse/stringify` let you validate/transform params. Here we make
 *   sure the id is numeric; anything else throws → errorComponent.
 * - The loader calls a server function that throws `notFound()` when the post
 *   doesn't exist → `notFoundComponent` below renders.
 * - Loader data is cached PER PARAMS: /path-params/1 and /path-params/2 are
 *   separate cache entries.
 */
import { Link, createFileRoute } from '@tanstack/react-router'
import { Callout, FeaturePage } from '~/components/FeaturePage'
import { NotFound } from '~/components/NotFound'
import { getPost } from '~/utils/posts.functions'

export const Route = createFileRoute('/path-params/$postId')({
  params: {
    parse: (raw) => {
      if (!/^\d+$/.test(raw.postId)) throw new Error(`postId must be numeric, got "${raw.postId}"`)
      return { postId: raw.postId }
    },
  },
  loader: ({ params }) => getPost({ data: { id: params.postId } }),
  // head() can use loader data — great for SEO titles.
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} — Path params` : 'Post not found' }],
  }),
  notFoundComponent: () => {
    // Route.useParams() works inside route-level components too.
    const { postId } = Route.useParams()
    return (
      <NotFound>
        <p>
          No post with id <code>{postId}</code>. This UI is the route&apos;s own <code>notFoundComponent</code>.
        </p>
      </NotFound>
    )
  },
  component: PostPage,
})

function PostPage() {
  const { postId } = Route.useParams()
  const post = Route.useLoaderData()
  return (
    <FeaturePage
      title={`Post #${postId}`}
      file="src/routes/path-params/$postId.tsx"
      intro={<p>The value of the dynamic segment is read with <code>Route.useParams()</code>.</p>}
    >
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{post.title}</h2>
        <p>{post.body}</p>
        <p className="muted">by {post.author}</p>
      </div>
      <div className="row">
        <Link to="/path-params/$postId" params={{ postId: String(Number(postId) - 1) }} disabled={postId === '1'}>
          ← previous
        </Link>
        {/* `params` can also be a function of the current params */}
        <Link to="/path-params/$postId" params={(prev) => ({ postId: String(Number(prev.postId) + 1) })}>
          next →
        </Link>
        <Link to="/path-params">back to list</Link>
      </div>
      <Callout>
        Try <a href="/path-params/abc">/path-params/abc</a> — <code>params.parse</code> rejects it and the error
        boundary renders.
      </Callout>
    </FeaturePage>
  )
}
