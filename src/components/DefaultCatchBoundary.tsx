/**
 * The default error UI, registered in src/router.tsx as
 * `defaultErrorComponent`. Any error thrown in a route's beforeLoad, loader
 * or component bubbles up to the nearest `errorComponent`; if the route has
 * none, this one is used.
 */
import { ErrorComponent, Link, rootRouteId, useMatch, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function DefaultCatchBoundary({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({ strict: false, select: (state) => state.id === rootRouteId })

  return (
    <div className="error-box">
      <h2>Something went wrong (default error boundary)</h2>
      {/* <ErrorComponent> is a tiny built-in UI that prints the error message. */}
      <ErrorComponent error={error} />
      <div className="row">
        <button
          onClick={() => {
            // reset() clears the error boundary; invalidate() re-runs loaders.
            reset()
            router.invalidate()
          }}
        >
          Try again
        </button>
        {isRoot ? <Link to="/">Home</Link> : <button onClick={() => window.history.back()}>Go back</button>}
      </div>
    </div>
  )
}
