/**
 * src/routes/routing._pathless.inside.tsx  →  "/routing/inside"
 *
 * Child of the pathless layout. Notice the URL: "_pathless" is not in it.
 */
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/routing/_pathless/inside')({
  component: Inside,
})

function Inside() {
  return (
    <p>
      File: <code>src/routes/routing._pathless.inside.tsx</code>. The URL is <code>/routing/inside</code>, yet this is
      wrapped in the box from the pathless layout. Three levels of layouts are rendering right now: root → routing →
      _pathless → this.
    </p>
  )
}
