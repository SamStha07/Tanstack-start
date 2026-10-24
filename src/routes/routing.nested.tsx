/**
 * src/routes/routing.nested.tsx  →  "/routing/nested"
 *
 * The dot in the file name means "nested under". `routing.nested.tsx` is a
 * child of `routing.tsx`, so it renders INSIDE that layout's <Outlet />.
 * The folder form src/routes/routing/nested.tsx is exactly equivalent — mix
 * and match whichever reads better.
 */
import { createFileRoute } from '@tanstack/react-router'
import { Explain } from '~/components/FeaturePage'

export const Route = createFileRoute('/routing/nested')({
  component: Nested,
})

function Nested() {
  return (
    <Explain title="A nested child route">
      <p>
        File: <code>src/routes/routing.nested.tsx</code>. The header above did not re-mount when you navigated — only
        the <code>&lt;Outlet /&gt;</code> content changed. Layouts keep their state across child navigations.
      </p>
      <p>
        Tip: to render a URL like <code>/routing/standalone</code> <em>without</em> the parent layout, name the file{' '}
        <code>routing_.standalone.tsx</code> (trailing underscore on the parent segment).
      </p>
    </Explain>
  )
}
