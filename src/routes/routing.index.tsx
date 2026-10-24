/**
 * src/routes/routing.index.tsx  →  "/routing"
 *
 * The `.index` suffix makes this the INDEX child of the `/routing` layout: it
 * renders inside routing.tsx's <Outlet /> when the URL is exactly "/routing".
 * (Equivalent folder form: src/routes/routing/index.tsx)
 */
import { createFileRoute } from '@tanstack/react-router'
import { Code, Explain } from '~/components/FeaturePage'

export const Route = createFileRoute('/routing/')({
  component: RoutingIndex,
})

function RoutingIndex() {
  return (
    <Explain title="You are on the index child route">
      <p>
        File: <code>src/routes/routing.index.tsx</code>. Note the trailing slash in{' '}
        <code>createFileRoute(&apos;/routing/&apos;)</code> — that is how index routes are identified.
      </p>
      <p>How the files in this demo map to the route tree:</p>
      <Code>{`
src/routes/
├── __root.tsx                    <html> shell, wraps everything
├── routing.tsx                   /routing        (layout with <Outlet/>)
├── routing.index.tsx             /routing        (index child)  ← you are here
├── routing.nested.tsx            /routing/nested
├── routing._pathless.tsx         (no URL segment — layout only)
└── routing._pathless.inside.tsx  /routing/inside
      `}</Code>
      <p>
        Every route file exports <code>Route</code>, created with <code>createFileRoute(path)(options)</code>. The
        options object is where everything happens: <code>component</code>, <code>loader</code>,{' '}
        <code>beforeLoad</code>, <code>validateSearch</code>, <code>head</code>, <code>errorComponent</code>,{' '}
        <code>pendingComponent</code>, <code>ssr</code>, <code>server</code> … each covered in its own page of this
        app.
      </p>
    </Explain>
  )
}
