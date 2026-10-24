/**
 * HYDRATION & ClientOnly — src/routes/hydration.tsx  →  "/hydration"
 * ============================================================================
 * Hydration = React in the browser attaching to the server-rendered HTML.
 * For that to work, the FIRST client render must produce the same markup as
 * the server did. If not → "hydration mismatch" warnings and UI glitches.
 *
 * Typical causes: Date.now()/new Date(), Math.random(), window/localStorage,
 * the user's locale or timezone, browser extensions.
 *
 * Fixes, from best to worst:
 *   1. Compute the value ONCE on the server (loader) and pass it down — both
 *      renders then use the same data.
 *   2. `useHydrated()` — false during SSR and the first client render, true
 *      afterwards. Render a stable placeholder until it's true.
 *   3. `<ClientOnly fallback={…}>` — don't render the children on the server
 *      at all.
 *   4. `suppressHydrationWarning` on a single element whose TEXT is expected
 *      to differ (e.g. a timestamp). Silences the warning only.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/hydration-errors
 */
import { ClientOnly, createFileRoute, useHydrated } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'

const getServerNow = createServerFn({ method: 'GET' }).handler(() => new Date())

export const Route = createFileRoute('/hydration')({
  loader: () => getServerNow(),
  component: HydrationPage,
})

function HydrationPage() {
  const serverNow = Route.useLoaderData()
  const hydrated = useHydrated()
  const [seconds, setSeconds] = useState(0)

  // Effects only run in the browser, after hydration.
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <FeaturePage
      title="Hydration & ClientOnly"
      file="src/routes/hydration.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/hydration-errors"
      intro={<p>Making the first browser render match the server HTML.</p>}
    >
      <Demo title="useHydrated()">
        <p>
          hydrated = <strong>{String(hydrated)}</strong>{' '}
          <span className="muted">(view-source shows &quot;false&quot;; the live page shows &quot;true&quot;)</span>
        </p>
        <button disabled={!hydrated}>{hydrated ? 'I am interactive now' : 'Waiting for JS…'}</button>
        <p>Seconds since hydration: {seconds}</p>
      </Demo>

      <Demo title="1. Same data on both sides (from the loader) ✓">
        <p>Server time from loader: {serverNow.toISOString()}</p>
      </Demo>

      <Demo title="2/3. Browser-specific values">
        <p>
          Your timezone:{' '}
          <strong>{hydrated ? Intl.DateTimeFormat().resolvedOptions().timeZone : '…'}</strong> (useHydrated)
        </p>
        <ClientOnly fallback={<p className="skeleton" />}>
          <p>Your locale formats this as: {new Date().toLocaleString()} (ClientOnly)</p>
        </ClientOnly>
      </Demo>

      <Demo title="4. suppressHydrationWarning">
        <p>
          Rendered at <time suppressHydrationWarning>{new Date().toLocaleTimeString()}</time> — server and client
          differ by a few ms, and that&apos;s OK here.
        </p>
      </Demo>

      <Code>{`
// ✗ mismatch: server and browser compute different values
<p>{new Date().toLocaleString()}</p>

// ✓ options
const hydrated = useHydrated()
<p>{hydrated ? new Date().toLocaleString() : '…'}</p>
<ClientOnly fallback={<Skeleton />}><BrowserOnlyWidget /></ClientOnly>
<time suppressHydrationWarning>{new Date().toLocaleTimeString()}</time>
      `}</Code>
    </FeaturePage>
  )
}
