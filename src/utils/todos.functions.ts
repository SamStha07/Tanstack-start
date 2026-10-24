/**
 * Server functions for the todo demo (src/routes/server-functions.tsx).
 * ----------------------------------------------------------------------------
 * Anatomy of a server function:
 *
 *   createServerFn({ method: 'GET' | 'POST' })   // GET is the default
 *     .middleware([...])                         // optional (see /middleware)
 *     .validator(schemaOrFn)                     // optional input validation
 *     .handler(async ({ data, context }) => …)   // runs ONLY on the server
 *
 * Calling it:  await addTodo({ data: { title: 'x' } })
 *   - on the server (SSR loader, other server fn) → plain function call
 *   - in the browser → HTTP request to /_serverFn/<id>, result deserialized
 *
 * Choosing the method:
 *   GET  → reads. Input is sent in the URL; responses may be cached.
 *   POST → writes / mutations. Input is in the body. Protected by the CSRF
 *          middleware in src/start.ts.
 *
 * ⚠️ A server function is a PUBLIC HTTP endpoint. Anyone can call it with any
 *    input — always validate input and check auth INSIDE it (or in its
 *    middleware). See src/routes/auth/ for a protected example.
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db, sleep } from '~/server/db.server'

export const listTodos = createServerFn({ method: 'GET' }).handler(async () => {
  await sleep(150)
  return db.todos
})

// Validation with a zod schema: `data` is typed from the schema, and invalid
// input throws before the handler runs (the error reaches the caller).
export const addTodo = createServerFn({ method: 'POST' })
  .validator(z.object({ title: z.string().trim().min(1, 'Title cannot be empty').max(80) }))
  .handler(async ({ data }) => {
    await sleep(200)
    const todo = { id: db.nextTodoId++, title: data.title, done: false, createdAt: new Date().toISOString() }
    db.todos.push(todo)
    return todo
  })

// Validation with a plain function: whatever it returns becomes `data`.
export const toggleTodo = createServerFn({ method: 'POST' })
  .validator((input: { id: number }) => {
    if (!Number.isInteger(input.id)) throw new Error('id must be an integer')
    return input
  })
  .handler(async ({ data }) => {
    const todo = db.todos.find((t) => t.id === data.id)
    if (!todo) throw new Error(`Todo ${data.id} not found`)
    todo.done = !todo.done
    return todo
  })

export const deleteTodo = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    db.todos = db.todos.filter((t) => t.id !== data.id)
    return { deleted: data.id }
  })
