/**
 * Auth server functions + middleware — src/utils/auth.functions.ts
 * ----------------------------------------------------------------------------
 * The SECURITY BOUNDARY is here, on the server:
 *   - `authMiddleware` rejects unauthenticated calls and puts `user` in context
 *   - every server function that returns private data uses it
 *
 * Route guards (`beforeLoad` in src/routes/auth/_protected.tsx) only improve
 * UX — they redirect the user to the login page. They do NOT protect server
 * functions, which are public HTTP endpoints anyone can call directly.
 */
import { redirect } from '@tanstack/react-router'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { setResponseHeader, setResponseStatus } from '@tanstack/react-start/server'
import { z } from 'zod'
import { db, sleep } from '~/server/db.server'
import { createSession, destroySession, getSessionUser } from '~/server/session.server'

/** Who is logged in? (null when anonymous). Safe to call from any beforeLoad. */
export const getCurrentUser = createServerFn({ method: 'GET' }).handler(() => {
  // Identity-dependent → must never be cached publicly.
  setResponseHeader('Cache-Control', 'private, no-store')
  return getSessionUser()
})

export const login = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    await sleep(300) // slows down brute force a little; use real rate limiting in production
    const user = db.users.find((u) => u.email === data.email.toLowerCase())
    // ⚠️ Demo only: real apps store password HASHES (argon2/bcrypt/scrypt) and
    //    compare them in constant time. Same error for "no user" and "bad
    //    password" so attackers can't discover which emails exist.
    if (!user || user.password !== data.password) {
      setResponseStatus(401)
      throw new Error('Invalid email or password')
    }
    createSession(user.id)
    return { ok: true }
  })

export const logout = createServerFn({ method: 'POST' }).handler(() => {
  destroySession()
  // Throwing redirect() from a server function navigates the client
  // (the caller must use useServerFn so the router can handle it).
  throw redirect({ to: '/auth' })
})

/** Function middleware: the server-side gate for private data. */
export const authMiddleware = createMiddleware({ type: 'function' }).server(({ next }) => {
  const user = getSessionUser()
  if (!user) {
    setResponseStatus(401)
    throw new Error('Unauthorized: please log in')
  }
  return next({ context: { user } })
})

/** Builds on authMiddleware and additionally requires the admin role. */
export const adminMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(({ next, context }) => {
    if (context.user.role !== 'admin') {
      setResponseStatus(403)
      throw new Error('Forbidden: admins only')
    }
    return next()
  })

export const getMyDashboard = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) => {
    setResponseHeader('Cache-Control', 'private, no-store')
    return {
      greeting: `Welcome back, ${context.user.name}!`,
      todosOpen: db.todos.filter((t) => !t.done).length,
      activeSessions: db.sessions.size,
    }
  })

export const getAdminReport = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(() => ({
    users: db.users.map(({ id, name, email, role }) => ({ id, name, email, role })),
  }))
