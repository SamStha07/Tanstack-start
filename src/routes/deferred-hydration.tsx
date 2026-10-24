/**
 * DEFERRED HYDRATION — src/routes/deferred-hydration.tsx  →  "/deferred-hydration"
 *   (experimental)
 * ============================================================================
 * Normally the whole page hydrates at once. `<Hydrate when={…}>` marks a
 * part of the page as "visible now, interactive later":
 *
 *   - its HTML is server-rendered as usual (visible, indexable),
 *   - its React tree is NOT hydrated until the strategy fires,
 *   - by default its JS is split into a separate chunk that isn't even
 *     downloaded until then (`split={false}` to disable).
 *
 * Strategies (from '@tanstack/react-start/hydration'):
 *   visible({ rootMargin })   when scrolled near the viewport
 *   idle()                    when the browser is idle
 *   interaction({ events })   on pointerenter / focus / click …
 *   media('(min-width: …)')   when a media query matches
 *   condition(bool)           when a value becomes truthy
 *   load()                    right after the page load event
 *   never()                   stay static HTML forever
 * Optional `prefetch={idle()}` downloads the chunk early without hydrating.
 *
 * Only applies to the initial document. After client navigation there is no
 * server HTML to preserve, so boundaries render normally.
 *
 * Good candidates: below-the-fold comments, maps, charts, carousels.
 * Bad candidates: navigation, primary buttons, anything needed immediately.
 *
 * Try it: reload the page, then click the counters BEFORE and AFTER their
 * strategy fires. Before hydration, clicks do nothing.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration
 */
import { createFileRoute } from '@tanstack/react-router'
import { Hydrate } from '@tanstack/react-start'
import { idle, interaction, media, never, visible } from '@tanstack/react-start/hydration'
import { useEffect, useState } from 'react'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'

export const Route = createFileRoute('/deferred-hydration')({
  component: DeferredHydrationPage,
})

/** A counter that shows whether it has hydrated yet. */
function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), []) // effects only run once hydrated
  return (
    <div className="card row">
      <span className="pill" style={hydrated ? undefined : { background: 'var(--warn-soft)', color: 'var(--warn)' }}>
        {hydrated ? 'hydrated ✓' : 'static HTML'}
      </span>
      <strong>{label}</strong>
      <button onClick={() => setCount((c) => c + 1)}>clicked {count}×</button>
    </div>
  )
}

function DeferredHydrationPage() {
  const [log, setLog] = useState<Array<string>>([])
  const onHydrated = (name: string) => () => setLog((l) => [...l, `${new Date().toLocaleTimeString()} — ${name} hydrated`])

  return (
    <FeaturePage
      title="Deferred hydration"
      file="src/routes/deferred-hydration.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration"
      intro={<p>Server HTML now, interactivity later — boundary by boundary.</p>}
    >
      <Demo title="Strategies">
        <Counter label="no boundary (hydrates immediately)" />
        <Hydrate when={idle()} onHydrated={onHydrated('idle()')}>
          <Counter label="idle()" />
        </Hydrate>
        <Hydrate when={interaction()} onHydrated={onHydrated('interaction()')}>
          <Counter label="interaction() — hover or focus me" />
        </Hydrate>
        <Hydrate when={media('(min-width: 900px)')} onHydrated={onHydrated('media()')}>
          <Counter label="media('(min-width: 900px)') — widen the window" />
        </Hydrate>
        <Hydrate when={never()}>
          <Counter label="never() — stays static forever" />
        </Hydrate>
        <p className="muted">Scroll down for the visible() boundary ↓</p>
        <Code>{log.length ? log.join('\n') : '(hydration log is empty — reload the page to watch it fill)'}</Code>
      </Demo>

      <div style={{ height: '110vh' }} className="muted">
        (spacer — keep scrolling)
      </div>

      <Demo title="visible()">
        <Hydrate when={visible({ rootMargin: '0px' })} onHydrated={onHydrated('visible()')}>
          <Counter label="visible() — hydrated when scrolled into view" />
        </Hydrate>
      </Demo>

      <Code>{`
import { Hydrate } from '@tanstack/react-start'
import { visible, idle } from '@tanstack/react-start/hydration'

<Hydrate when={visible({ rootMargin: '400px' })} prefetch={idle()}>
  <Reviews />
</Hydrate>
      `}</Code>
    </FeaturePage>
  )
}
