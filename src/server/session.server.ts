/**
 * Session helpers (server only) — src/server/session.server.ts
 * ----------------------------------------------------------------------------
 * A minimal, dependency-free cookie session:
 *   - login creates a random opaque token, stores { userId, expiresAt } in the
 *     in-memory db, and sends the token in an httpOnly cookie
 *   - every request reads the cookie and looks the token up
 *   - logout deletes the token server-side and clears the cookie
 *
 * Cookie flags matter:
 *   httpOnly  → JS in the page can't read it (XSS can't steal the session)
 *   secure    → HTTPS only (disabled in dev because localhost is http)
 *   sameSite  → 'lax' blocks most cross-site request forgery
 *   maxAge    → finite lifetime
 *
 * In a real app use a real store (DB/Redis) or a library such as Better Auth,
 * Clerk, WorkOS or Auth.js — see the official auth guide.
 */
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { db } from './db.server'

const COOKIE_NAME = 'demo_session'
const MAX_AGE_SECONDS = 60 * 60 * 2 // 2 hours

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
}

export function createSession(userId: string) {
  const token = crypto.randomUUID()
  db.sessions.set(token, { userId, expiresAt: Date.now() + MAX_AGE_SECONDS * 1000 })
  setCookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: MAX_AGE_SECONDS })
}

export function destroySession() {
  const token = getCookie(COOKIE_NAME)
  if (token) db.sessions.delete(token)
  deleteCookie(COOKIE_NAME, cookieOptions())
}

/** Returns the logged-in user (without the password) or null. */
export function getSessionUser() {
  const token = getCookie(COOKIE_NAME)
  if (!token) return null
  const session = db.sessions.get(token)
  if (!session || session.expiresAt < Date.now()) {
    db.sessions.delete(token)
    return null
  }
  const user = db.users.find((u) => u.id === session.userId)
  if (!user) return null
  const { password: _password, ...safeUser } = user
  return safeUser
}
