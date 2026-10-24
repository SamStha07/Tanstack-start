/**
 * REACT SERVER COMPONENTS — src/routes/server-components/index.tsx
 *   →  "/server-components"            (experimental feature)
 * ============================================================================
 * In TanStack Start, an RSC is DATA: you render React on the server inside a
 * server function, return it, and render it on the client like any value.
 * The app stays isomorphic-first; RSCs are opt-in fragments.
 *
 *   const getGreeting = createServerFn().handler(async () => {
 *     const Renderable = await renderServerComponent(<Greeting />)
 *     return { Renderable }
 *   })
 *   loader: () => getGreeting()
 *   component: () => <>{Route.useLoaderData().Renderable}</>
 *
 * Why? The component's CODE and its DEPENDENCIES never ship to the browser —
 * only the rendered result (React "Flight" format). Great for heavy libraries
 * (markdown, syntax highlighting), server-only data, secrets.
 *
 * SETUP (already done here):
 *   npm i -D @vitejs/plugin-rsc
 *   vite.config.ts: tanstackStart({ rsc: { enabled: true } }), rsc(), viteReact()
 *
 * INSIDE server components you can:
 *   ✓ be `async` and await data directly (no loader needed for that part)
 *   ✓ use Node APIs (fs, os, crypto, DB clients …)
 *   ✓ use <Suspense> — slow parts STREAM in after the rest
 *   ✓ use TanStack Router <Link> — it hydrates into a working client link
 *   ✓ import CSS Modules / global CSS
 *   ✗ NO hooks / state / event handlers (useState, onClick …). For
 *     interactivity, use a Composite Component → /server-components/composite
 *
 * `renderServerComponent` output has no slots: it's a finished fragment.
 * Refresh it with `router.invalidate()` (it is just loader data).
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/server-components
 */
import { readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { renderServerComponent } from '@tanstack/react-start/rsc'
import { Suspense } from 'react'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { db, sleep } from '~/server/db.server'
import styles from './-components/rsc.module.css'

// ─── Server components ─────────────────────────────────────────────────────
// These functions are only ever rendered inside renderServerComponent(), so
// they run on the server only. Note that they are `async`!

async function ServerInfoCard() {
  // Reading a file from disk — impossible in the browser.
  const pkg = JSON.parse(await readFile(path.join(process.cwd(), 'package.json'), 'utf8')) as {
    dependencies: Record<string, string>
  }
  return (
    <div className={styles.panel}>
      <span className={styles.badge}>server component</span>
      <p>
        Rendered on <strong>{os.hostname()}</strong> ({os.platform()}, Node {process.version}) at{' '}
        {new Date().toLocaleTimeString()}.
      </p>
      <p>
        Read <code>package.json</code> from disk: this app depends on{' '}
        <strong>{Object.keys(pkg.dependencies).length}</strong> packages, e.g.{' '}
        <code>@tanstack/react-start@{pkg.dependencies['@tanstack/react-start']}</code>.
      </p>
    </div>
  )
}

async function SlowPostList() {
  await sleep(1500) // pretend this is a slow database query
  return (
    <div className={styles.panel}>
      <span className={styles.badge}>streamed after 1.5s via &lt;Suspense&gt;</span>
      <ul>
        {db.posts.map((post) => (
          <li key={post.id}>
            {/* Router <Link> works inside server components */}
            <Link to="/path-params/$postId" params={{ postId: post.id }}>
              {post.title}
            </Link>{' '}
            — {post.likes} ❤
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Server function that renders them ─────────────────────────────────────
const getServerContent = createServerFn({ method: 'GET' }).handler(async () => {
  const Renderable = await renderServerComponent(
    <div>
      <ServerInfoCard />
      <Suspense fallback={<div className="skeleton" style={{ height: 90 }} />}>
        <SlowPostList />
      </Suspense>
    </div>,
  )
  return { Renderable }
})

export const Route = createFileRoute('/server-components/')({
  loader: () => getServerContent(),
  component: ServerComponentsPage,
})

function ServerComponentsPage() {
  const { Renderable } = Route.useLoaderData()
  const router = useRouter()
  return (
    <FeaturePage
      title="React Server Components"
      file="src/routes/server-components/index.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/server-components"
      intro={
        <p>
          The orange boxes were rendered on the server. Their code (including <code>node:fs</code> and{' '}
          <code>node:os</code> usage) is <strong>not</strong> in the browser bundle — only the result is.
        </p>
      }
    >
      <Demo title="A server component returned from a server function">
        {/* Render it like any React node */}
        {Renderable}
        <button onClick={() => router.invalidate()}>router.invalidate() → re-render on the server</button>
      </Demo>
      <p>
        Next: <Link to="/server-components/composite">Composite components (server markup + client slots)</Link> ·{' '}
        <Link to="/server-components/with-query">RSC + TanStack Query</Link>
      </p>
      <Code>{`
async function ServerInfoCard() {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'))   // server only!
  return <div>{pkg.name}</div>
}

const getServerContent = createServerFn().handler(async () => ({
  Renderable: await renderServerComponent(
    <Suspense fallback={<Skeleton/>}><ServerInfoCard /></Suspense>
  ),
}))

export const Route = createFileRoute('/server-components/')({
  loader: () => getServerContent(),
  component: () => <>{Route.useLoaderData().Renderable}</>,
})
      `}</Code>
    </FeaturePage>
  )
}
