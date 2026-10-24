/**
 * SERVER FUNCTIONS — src/routes/server-functions.tsx  →  "/server-functions"
 * ============================================================================
 * `createServerFn` is THE way to run server-only code in TanStack Start
 * (database queries, secrets, file system …). There is no "use server" and no
 * getServerSideProps — just functions.
 *
 *   const getTime = createServerFn().handler(() => new Date().toISOString())
 *   await getTime()   // works from loaders, components, event handlers, hooks
 *
 * The build replaces the handler in the CLIENT bundle with an RPC stub, so
 * your server code (and its imports) never reach the browser.
 *
 * This page shows:
 *   1. Server functions declared in the route file itself (getServerInfo)
 *   2. Server functions imported from src/utils/todos.functions.ts
 *   3. Calling them from a loader AND from event handlers
 *   4. `useServerFn()` — wraps a server fn for use in components. Required if
 *      the function may throw redirect()/notFound() so the router handles it.
 *   5. After a mutation: `router.invalidate()` re-runs loaders so the UI shows
 *      the persisted data (the server is the source of truth).
 *   6. Validation errors surfacing in the UI.
 *
 * Return values may be anything Start can serialize: primitives, plain
 * objects/arrays, Date, Map, Set, BigInt, undefined, Error, Promises,
 * ReadableStreams, async iterables …
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
 */
// `node:os` is a Node.js module. Importing it in a route file is fine because
// it is only USED inside a server function handler — the compiler removes the
// handler (and therefore this import) from the client bundle.
import os from 'node:os'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Callout, Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { addTodo, deleteTodo, listTodos, toggleTodo } from '~/utils/todos.functions'

// You can also define a server function right inside a route file.
const getServerInfo = createServerFn({ method: 'GET' }).handler(() => ({
  hostname: os.hostname(),
  platform: os.platform(),
  uptimeSeconds: Math.round(os.uptime()),
  // Dates/Maps survive the trip thanks to Start's serializer.
  now: new Date(),
  tags: new Set(['server', 'only']),
}))

export const Route = createFileRoute('/server-functions')({
  // Run two server functions in parallel from the loader.
  loader: async () => {
    const [todos, info] = await Promise.all([listTodos(), getServerInfo()])
    return { todos, info }
  },
  component: ServerFunctionsPage,
})

function ServerFunctionsPage() {
  const { todos, info } = Route.useLoaderData()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [manual, setManual] = useState<string | null>(null)

  // useServerFn: recommended way to call server fns from components.
  const addTodoFn = useServerFn(addTodo)
  const toggleTodoFn = useServerFn(toggleTodo)
  const deleteTodoFn = useServerFn(deleteTodo)

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      // Re-run this route's loader so we render what the server has stored.
      await router.invalidate()
    } catch (e) {
      // Validation errors (zod) and thrown Errors arrive here.
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <FeaturePage
      title="Server functions"
      file="src/routes/server-functions.tsx (+ src/utils/todos.functions.ts)"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/server-functions"
      intro={<p>Type-safe RPCs. Write a function, call it from anywhere, it runs on the server.</p>}
    >
      <Demo title="Todo list — data lives in server memory">
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault()
            void run(async () => {
              await addTodoFn({ data: { title } })
              setTitle('')
            })
          }}
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="new todo (try empty!)" />
          <button disabled={busy}>Add</button>
        </form>
        {error && <p style={{ color: 'var(--danger)' }}>Server said: {error}</p>}
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className="row">
              <input type="checkbox" checked={todo.done} disabled={busy} onChange={() => run(() => toggleTodoFn({ data: { id: todo.id } }))} />
              <span style={{ textDecoration: todo.done ? 'line-through' : undefined }}>{todo.title}</span>
              <button disabled={busy} onClick={() => run(() => deleteTodoFn({ data: { id: todo.id } }))}>
                ✕
              </button>
            </li>
          ))}
        </ul>
        <p className="muted">Open DevTools → Network: each action is a POST to <code>/_serverFn/…</code>. Reload — the data persists (until the dev server restarts).</p>
      </Demo>

      <Demo title="A server function defined in the route file">
        <Code>{JSON.stringify({ ...info, now: info.now.toISOString(), tags: [...info.tags] }, null, 2)}</Code>
        <p className="muted">
          <code>info.now</code> is a real <code>Date</code> and <code>info.tags</code> a real <code>Set</code> on the
          client — Start&apos;s serializer handles more than JSON.
        </p>
        <button
          onClick={async () => {
            // Server functions can be called directly too (no hook needed for plain data).
            const fresh = await getServerInfo()
            setManual(`uptime is now ${fresh.uptimeSeconds}s (fetched at ${fresh.now.toLocaleTimeString()})`)
          }}
        >
          Call getServerInfo() from a click handler
        </button>
        {manual && <p>{manual}</p>}
      </Demo>

      <Callout kind="warning">
        Server functions are public endpoints. A route guard does not protect them — validate input and check auth
        inside the function or its middleware (see <code>src/routes/auth/</code>).
      </Callout>

      <Code>{`
// src/utils/todos.functions.ts
export const addTodo = createServerFn({ method: 'POST' })
  .validator(z.object({ title: z.string().min(1) }))
  .handler(async ({ data }) => db.todos.push({ title: data.title }))

// component
const addTodoFn = useServerFn(addTodo)
await addTodoFn({ data: { title } })
await router.invalidate()   // refresh loader data
      `}</Code>
    </FeaturePage>
  )
}
