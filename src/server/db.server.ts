/**
 * A tiny in-memory "database" used by the demos.
 * ----------------------------------------------------------------------------
 * The `.server.ts` suffix turns on Start's IMPORT PROTECTION: importing this
 * file from client code (a component, a loader …) is an error in production
 * builds. It may only be imported from server-only places such as
 * `createServerFn(...).handler()` bodies, server routes and middleware.
 *
 * Data lives on `globalThis` so it survives hot reloads and is shared between
 * Vite's server environments (SSR + RSC) in development.
 * Restarting the server resets everything.
 */

export type Todo = { id: number; title: string; done: boolean; createdAt: string }
export type Post = { id: string; title: string; body: string; author: string; likes: number }
export type User = { id: string; name: string; email: string; password: string; role: 'admin' | 'user' }

type Db = {
  todos: Array<Todo>
  posts: Array<Post>
  users: Array<User>
  sessions: Map<string, { userId: string; expiresAt: number }>
  guestbook: Array<{ name: string; message: string; at: string }>
  nextTodoId: number
}

const g = globalThis as typeof globalThis & { __learningDb?: Db }

export const db: Db = (g.__learningDb ??= {
  todos: [
    { id: 1, title: 'Read src/routes/server-functions.tsx', done: true, createdAt: new Date().toISOString() },
    { id: 2, title: 'Add a todo using the form', done: false, createdAt: new Date().toISOString() },
  ],
  posts: [
    { id: '1', title: 'Why TanStack Start?', body: 'Type-safe routing, server functions and full-document SSR built on Vite.', author: 'Tanner', likes: 3 },
    { id: '2', title: 'Loaders are isomorphic', body: 'A loader runs on the server for the first request and in the browser for client-side navigations.', author: 'Manuel', likes: 7 },
    { id: '3', title: 'Server functions are RPCs', body: 'createServerFn turns a function into an endpoint; the client bundle gets a tiny fetch stub.', author: 'Sean', likes: 1 },
  ],
  users: [
    { id: 'u1', name: 'Ada Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { id: 'u2', name: 'Uma User', email: 'user@example.com', password: 'user123', role: 'user' },
  ],
  sessions: new Map(),
  guestbook: [],
  nextTodoId: 3,
})

/** Simulate network / database latency. */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
