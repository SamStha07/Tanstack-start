/**
 * Small presentational helpers shared by every feature page so the route
 * files can focus on the feature itself. Nothing TanStack-specific here.
 */
import type { ReactNode } from 'react'

export function FeaturePage(props: {
  title: string
  /** The route file a learner should open to read the code. */
  file: string
  /** Link to the official TanStack docs page for this feature. */
  docs?: string
  intro: ReactNode
  children: ReactNode
}) {
  return (
    <article className="feature">
      <header className="feature-header">
        <h1>{props.title}</h1>
        <p className="feature-meta">
          📄 Read the code: <code>{props.file}</code>
          {props.docs ? (
            <>
              {' · '}
              <a href={props.docs} target="_blank" rel="noreferrer">
                Official docs ↗
              </a>
            </>
          ) : null}
        </p>
        <div className="feature-intro">{props.intro}</div>
      </header>
      {props.children}
    </article>
  )
}

/** A bordered box that holds a live, interactive example. */
export function Demo(props: { title: string; children: ReactNode }) {
  return (
    <section className="demo">
      <h2 className="demo-title">▶ {props.title}</h2>
      <div className="demo-body">{props.children}</div>
    </section>
  )
}

/** A prose section explaining a concept. */
export function Explain(props: { title: string; children: ReactNode }) {
  return (
    <section className="explain">
      <h2>{props.title}</h2>
      {props.children}
    </section>
  )
}

/** A highlighted tip / warning. */
export function Callout(props: { kind?: 'tip' | 'warning'; children: ReactNode }) {
  return <div className={`callout callout-${props.kind ?? 'tip'}`}>{props.children}</div>
}

/** A static code snippet (just preformatted text — no syntax highlighting). */
export function Code(props: { children: string }) {
  return (
    <pre className="code">
      <code>{props.children.trim()}</code>
    </pre>
  )
}
