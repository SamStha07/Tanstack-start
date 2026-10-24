/**
 * NAVIGATION — src/routes/navigation.tsx  →  "/navigation"
 * ============================================================================
 * All the ways to move between routes:
 *
 *  <Link>            Declarative, type-safe link. Renders a real <a href>.
 *                    Props: to, params, search, hash, replace, preload,
 *                    activeProps / inactiveProps, activeOptions, disabled …
 *  useNavigate()     Imperative navigation from event handlers.
 *  <Navigate />      Navigate as soon as it renders (declarative redirect).
 *  redirect()        THROW it from beforeLoad / loader / server functions
 *                    (see src/routes/navigation_.old-page.tsx).
 *  useBlocker()      Prevent navigation, e.g. when a form has unsaved changes.
 *  useLocation() / useRouterState() / useCanGoBack()  Read navigation state.
 *  linkOptions()     Define reusable, type-checked link objects.
 *
 * Preloading: with `defaultPreload: 'intent'` (src/router.tsx) hovering a
 * link loads the target route's code AND runs its loader, so the click feels
 * instant. Override per-link with `preload={false | 'intent' | 'viewport' |
 * 'render'}`.
 *
 * Docs: https://tanstack.com/router/latest/docs/framework/react/guide/navigation
 */
import {
  Link,
  Navigate,
  createFileRoute,
  linkOptions,
  useBlocker,
  useCanGoBack,
  useLocation,
  useNavigate,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { useState } from 'react'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'

// Reusable, fully type-checked link definitions.
const quickLinks = [
  { label: 'Post 2', link: linkOptions({ to: '/path-params/$postId', params: { postId: '2' } }) },
  { label: 'Fruits containing "an", sorted desc', link: linkOptions({ to: '/search-params', search: { q: 'an', sort: 'desc' } }) },
  { label: 'Jump to #blocker', link: linkOptions({ to: '/navigation', hash: 'blocker' }) },
]

export const Route = createFileRoute('/navigation')({
  component: NavigationPage,
})

function NavigationPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const location = useLocation()
  const canGoBack = useCanGoBack()
  // Subscribe to any part of the router state; `select` avoids re-renders.
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  const [goNow, setGoNow] = useState(false)

  return (
    <FeaturePage
      title="Navigation"
      file="src/routes/navigation.tsx"
      docs="https://tanstack.com/router/latest/docs/framework/react/guide/navigation"
      intro={<p>Links, imperative navigation, redirects, active states, preloading and blocking.</p>}
    >
      <Demo title="<Link> variations">
        <ul>
          {quickLinks.map(({ label, link }) => (
            <li key={label}>
              <Link {...link}>{label}</Link>
            </li>
          ))}
          <li>
            <Link to="/loaders" preload={false}>
              /loaders with preload disabled (hover does nothing)
            </Link>
          </li>
          <li>
            <Link to="/navigation" activeProps={{ style: { fontWeight: 700 } }} inactiveProps={{ style: { opacity: 0.6 } }}>
              Link to this page — bold because it is active
            </Link>
          </li>
          <li>
            <Link to="/navigation/old-page">/navigation/old-page → redirects back here via redirect()</Link>
          </li>
        </ul>
      </Demo>

      <Demo title="Imperative navigation with useNavigate / router.history">
        <div className="row">
          <button onClick={() => navigate({ to: '/path-params/$postId', params: { postId: '3' } })}>navigate() to post 3</button>
          {/* replace: true swaps the current history entry instead of pushing */}
          <button onClick={() => navigate({ to: '/navigation', hash: 'blocker', replace: true })}>
            navigate() with replace
          </button>
          <button disabled={!canGoBack} onClick={() => router.history.back()}>
            history.back()
          </button>
          <button onClick={() => setGoNow(true)}>render &lt;Navigate to=&quot;/&quot; /&gt;</button>
          {goNow && <Navigate to="/" />}
        </div>
        <p className="muted">Router is loading: {String(isLoading)}</p>
        <Code>{JSON.stringify({ pathname: location.pathname, search: location.search, hash: location.hash }, null, 2)}</Code>
      </Demo>

      <BlockerDemo />
    </FeaturePage>
  )
}

function BlockerDemo() {
  const [text, setText] = useState('')
  const dirty = text.length > 0

  // withResolver: true gives you { status, proceed, reset } to build your own
  // confirmation UI instead of the browser's window.confirm.
  const blocker = useBlocker({
    shouldBlockFn: () => dirty,
    enableBeforeUnload: dirty, // also warn on tab close / reload
    withResolver: true,
  })

  return (
    <Demo title="Blocking navigation with useBlocker">
      <div id="blocker" className="stack">
        <input placeholder="type something, then click a sidebar link" value={text} onChange={(e) => setText(e.target.value)} />
        {dirty && <span className="pill">unsaved changes — navigation is blocked</span>}
        {blocker.status === 'blocked' && (
          <div className="callout callout-warning">
            Leave <code>{blocker.current.pathname}</code> for <code>{blocker.next.pathname}</code>? Your text will be lost.
            <div className="row">
              <button onClick={blocker.proceed}>Leave</button>
              <button onClick={blocker.reset}>Stay</button>
            </div>
          </div>
        )}
      </div>
    </Demo>
  )
}
