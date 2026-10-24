/**
 * src/routes/routing._pathless.tsx  — a PATHLESS LAYOUT route
 *
 * A leading underscore (`_pathless`) means this route does NOT add a segment
 * to the URL. It still wraps its children with UI (and can run beforeLoad /
 * loader for all of them — perfect for auth guards, see src/routes/auth/).
 *
 * Its child `routing._pathless.inside.tsx` therefore lives at
 * "/routing/inside", not "/routing/pathless/inside".
 */
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/routing/_pathless')({
  component: PathlessLayout,
})

function PathlessLayout() {
  return (
    <div className="card">
      <span className="pill">rendered by routing._pathless.tsx (no URL segment)</span>
      <Outlet />
    </div>
  )
}
