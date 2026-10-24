/**
 * Server functions + query options for the TanStack Query demo.
 *
 * `queryOptions()` bundles a queryKey with its queryFn so the SAME object can
 * be used in a route loader (to prefetch during SSR) and in a component (to
 * read / subscribe). Keep key + fn together = no key typos.
 */
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db, sleep } from '~/server/db.server'

export const listGuestbook = createServerFn({ method: 'GET' }).handler(async () => {
  await sleep(200)
  return { entries: [...db.guestbook].reverse(), fetchedAt: new Date().toLocaleTimeString() }
})

export const getGuestbookStats = createServerFn({ method: 'GET' }).handler(async () => {
  await sleep(1500) // deliberately slow → streamed
  return { total: db.guestbook.length, uniqueNames: new Set(db.guestbook.map((e) => e.name)).size }
})

export const signGuestbook = createServerFn({ method: 'POST' })
  .validator(z.object({ name: z.string().trim().min(1, 'Name is required').max(40), message: z.string().trim().min(1, 'Message is required').max(200) }))
  .handler(async ({ data }) => {
    await sleep(300)
    db.guestbook.push({ ...data, at: new Date().toISOString() })
    return { ok: true }
  })

export const guestbookQuery = queryOptions({
  queryKey: ['guestbook'],
  queryFn: () => listGuestbook(),
})

export const guestbookStatsQuery = queryOptions({
  queryKey: ['guestbook', 'stats'],
  queryFn: () => getGuestbookStats(),
})
