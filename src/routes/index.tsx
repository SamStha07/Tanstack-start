/**
 * HOME PAGE — src/routes/index.tsx  →  URL "/"
 * ----------------------------------------------------------------------------
 * `index.tsx` is the index route of its folder: src/routes/index.tsx is "/".
 *
 * `createFileRoute('/')` — the string must match the file's path. You never
 * write it by hand: the Start Vite plugin fills it in / fixes it when you save
 * the file, and regenerates src/routeTree.gen.ts.
 */
import { Link, createFileRoute } from '@tanstack/react-router'
import { featureSections } from '~/features'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div>
      <h1>TanStack Start — learn every feature by reading the code</h1>
      <p>
        Every feature of TanStack Start lives in <strong>its own route</strong>. Open a page, play with the demo, then
        open the file shown at the top of the page — the code is heavily commented and is meant to be read top to
        bottom.
      </p>
      <div className="callout">
        <strong>Suggested order:</strong> go through the sections in order. Start with{' '}
        <code>src/routes/__root.tsx</code>, <code>src/router.tsx</code> and <code>vite.config.ts</code> (explained on{' '}
        <Link to="/entry-points">Entry points &amp; config</Link>), then follow the sidebar from top to bottom.
      </div>

      {featureSections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <div className="grid">
            {section.items.map((item) => (
              <Link key={item.to} to={item.to} className="card">
                <strong>{item.title}</strong>
                <div className="muted" style={{ fontSize: '0.9rem' }}>
                  {item.description}
                </div>
                <code style={{ fontSize: '0.75rem' }}>{item.file}</code>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
