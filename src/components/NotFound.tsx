/**
 * Default "404" UI — registered in src/router.tsx as
 * `defaultNotFoundComponent`. Rendered when no route matches the URL or when
 * a loader / beforeLoad throws `notFound()`.
 */
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export function NotFound({ children }: { children?: ReactNode }) {
  return (
    <div className="error-box">
      <h2>404 — Not found</h2>
      {children ?? <p>The page you are looking for does not exist.</p>}
      <Link to="/">← Back to the feature list</Link>
    </div>
  )
}
