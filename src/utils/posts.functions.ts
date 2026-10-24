/**
 * Shared server functions for the "posts" demo data.
 * ----------------------------------------------------------------------------
 * File naming convention recommended by TanStack Start:
 *   *.functions.ts → files that export createServerFn(...) wrappers.
 *                    SAFE to import from anywhere (components, loaders …):
 *                    in the client bundle every handler is replaced by a small
 *                    RPC stub that does `fetch()` to the server.
 *   *.server.ts    → server-only helpers (DB access, secrets). Import them
 *                    ONLY from inside handlers / other server-only code.
 *
 * See /server-functions for an in-depth explanation.
 */
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db, sleep } from '~/server/db.server'

export const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  await sleep(300)
  // Return plain serializable data (objects, arrays, Dates, Maps … are fine).
  return db.posts.map(({ id, title, author }) => ({ id, title, author }))
})

export const getPost = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await sleep(300)
    const post = db.posts.find((p) => p.id === data.id)
    // Throwing notFound() from a server function is caught by the router and
    // renders the nearest notFoundComponent.
    if (!post) throw notFound()
    return post
  })

export const likePost = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const post = db.posts.find((p) => p.id === data.id)
    if (!post) throw notFound()
    post.likes += 1
    return post
  })
