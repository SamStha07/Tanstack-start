/**
 * COMPOSITE COMPONENTS — src/routes/server-components/composite.tsx
 *   →  "/server-components/composite"          (experimental feature)
 * ============================================================================
 * A Composite Component is server-rendered markup with HOLES ("slots") that
 * the client fills with interactive components. Think "server layout, client
 * widgets inside".
 *
 *   // server: declare the slots in the props type
 *   const src = await createCompositeComponent((props: {
 *     children?: ReactNode                                    // 1. children slot
 *     renderActions?: (d: { postId: string }) => ReactNode    // 2. render-prop slot
 *     Share?: ComponentType<{ url: string }>                  // 3. component slot
 *   }) => <article>… {props.renderActions?.({ postId })} …</article>)
 *
 *   // client: fill them
 *   <CompositeComponent src={src} renderActions={({ postId }) => <LikeButton id={postId} />} Share={ShareButton}>
 *     <Comments />
 *   </CompositeComponent>
 *
 * Slot types:
 *   children        simple composition, server can't pass data in
 *   render props    server passes SERIALIZABLE data to client UI
 *   component props server renders <props.X a={1}/> with data, client supplies X
 *
 * Rules:
 *   - Slots are opaque on the server: no Children.map / cloneElement.
 *   - Data passed to slots must be serializable (strings, numbers, plain
 *     objects, arrays, Dates …).
 *
 * After a mutation, `router.invalidate()` re-runs the loader → the server
 * re-renders the composite with fresh data, while client slots keep working.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/server-components
 */
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { CompositeComponent, createCompositeComponent } from '@tanstack/react-start/rsc'
import { useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { z } from 'zod'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { db } from '~/server/db.server'
import { likePost } from '~/utils/posts.functions'
import styles from './-components/rsc.module.css'

const getPostCard = createServerFn({ method: 'GET' })
  .validator(z.object({ postId: z.string() }))
  .handler(async ({ data }) => {
    const post = db.posts.find((p) => p.id === data.postId) ?? db.posts[0]

    const src = await createCompositeComponent(
      (props: {
        children?: ReactNode
        renderActions?: (args: { postId: string; likes: number }) => ReactNode
        Share?: ComponentType<{ url: string; title: string }>
      }) => (
        <article className={styles.panel}>
          <span className={styles.badge}>server-rendered at {new Date().toLocaleTimeString()}</span>
          <h2 style={{ margin: '0.25rem 0' }}>{post.title}</h2>
          <p>{post.body}</p>
          <p className="muted">
            by {post.author} · {post.likes} likes (counted on the server)
          </p>
          {/* 2. render-prop slot: the server passes data to client UI */}
          <footer className="row">
            {props.renderActions?.({ postId: post.id, likes: post.likes })}
            {/* 3. component slot: server decides WHERE + WITH WHAT props */}
            {props.Share ? <props.Share url={`/path-params/${post.id}`} title={post.title} /> : null}
          </footer>
          {/* 1. children slot: whatever the client passes */}
          <section style={{ marginTop: '0.75rem' }}>{props.children}</section>
        </article>
      ),
    )
    return { src, postIds: db.posts.map((p) => p.id) }
  })

export const Route = createFileRoute('/server-components/composite')({
  // Search values are JSON-parsed: `?post=2` is the NUMBER 2, so validate a number.
  validateSearch: z.object({ post: z.number().int().catch(1).default(1) }),
  loaderDeps: ({ search }) => ({ post: search.post }),
  loader: ({ deps }) => getPostCard({ data: { postId: String(deps.post) } }),
  component: CompositePage,
})

function CompositePage() {
  const { src, postIds } = Route.useLoaderData()
  const { post } = Route.useSearch()
  return (
    <FeaturePage
      title="Composite components"
      file="src/routes/server-components/composite.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/server-components"
      intro={<p>Server-rendered card (orange) with three kinds of interactive client slots inside.</p>}
    >
      <div className="row">
        {postIds.map((id) => (
          <Route.Link key={id} to="." search={{ post: Number(id) }} style={{ fontWeight: Number(id) === post ? 700 : 400 }}>
            post {id}
          </Route.Link>
        ))}
      </div>
      <Demo title="<CompositeComponent> with children, a render prop and a component prop">
        <CompositeComponent src={src} renderActions={({ postId, likes }) => <LikeButton postId={postId} likes={likes} />} Share={ShareButton}>
          <Comments />
        </CompositeComponent>
      </Demo>
      <Code>{`
<CompositeComponent
  src={src}
  renderActions={({ postId, likes }) => <LikeButton postId={postId} likes={likes} />}
  Share={ShareButton}
>
  <Comments />
</CompositeComponent>
      `}</Code>
    </FeaturePage>
  )
}

// ─── Client components (normal React, with state & handlers) ───────────────

function LikeButton({ postId, likes }: { postId: string; likes: number }) {
  const router = useRouter()
  const like = useServerFn(likePost)
  const [pending, setPending] = useState(false)
  return (
    <button
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await like({ data: { id: postId } })
        await router.invalidate() // server re-renders the card with the new count
        setPending(false)
      }}
    >
      {pending ? '…' : `❤ Like (${likes})`}
    </button>
  )
}

function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard?.writeText(`${window.location.origin}${url}`).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      title={title}
    >
      {copied ? '✓ Copied link' : '🔗 Share'}
    </button>
  )
}

function Comments() {
  const [comments, setComments] = useState<Array<string>>([])
  const [text, setText] = useState('')
  return (
    <div className="card">
      <strong>Client-side comments (children slot)</strong>
      {comments.map((c, i) => (
        <p key={i}>💬 {c}</p>
      ))}
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) setComments((prev) => [...prev, text.trim()])
          setText('')
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="local-only comment" />
        <button>Add</button>
      </form>
    </div>
  )
}
