/**
 * CSS & STYLING — src/routes/css-styling.tsx  →  "/css-styling"
 * ============================================================================
 * TanStack Start uses Vite, so every Vite CSS feature works. Three approaches:
 *
 * 1. GLOBAL STYLESHEET (see src/routes/__root.tsx)
 *      import appCss from '~/styles/app.css?url'
 *      head: () => ({ links: [{ rel: 'stylesheet', href: appCss }] })
 *    `?url` gives you the URL of the built file; rendering it as a <link> in
 *    head() puts it in the server HTML → no flash of unstyled content.
 *
 * 2. CSS MODULES — files named *.module.css. Importing returns an object of
 *    scoped class names. Start collects CSS used by the matched routes and
 *    includes it in SSR automatically.
 *
 * 3. INLINE STYLES / CSS-in-JS / Tailwind — Tailwind v4 is just
 *    `@tailwindcss/vite` in vite.config.ts + `@import "tailwindcss"` in your
 *    css file. (Not installed in this project to keep it dependency-light.)
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/css-styling
 */
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'
import styles from './-components/css-demo.module.css'

export const Route = createFileRoute('/css-styling')({
  component: CssPage,
})

function CssPage() {
  const [hue, setHue] = useState(170)
  return (
    <FeaturePage
      title="CSS & styling"
      file="src/routes/css-styling.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/css-styling"
      intro={<p>Global CSS, CSS Modules and inline styles — all server-rendered.</p>}
    >
      <Demo title="1. Global stylesheet">
        <p>
          This dashed box uses the global <code>.demo</code> class from <code>src/styles/app.css</code>.
        </p>
      </Demo>

      <Demo title="2. CSS Module">
        <div className={styles.box}>
          <h3 className={styles.title}>Scoped styles</h3>
          <p>
            Rendered class names: <code>{styles.box}</code> and <code>{styles.title}</code> — hashed so they cannot
            collide.
          </p>
        </div>
        <Code>{`import styles from './-components/css-demo.module.css'
<div className={styles.box}>…</div>`}</Code>
      </Demo>

      <Demo title="3. Inline / dynamic styles">
        <input type="range" min={0} max={360} value={hue} onChange={(e) => setHue(Number(e.target.value))} />
        <div style={{ background: `hsl(${hue} 70% 45%)`, color: 'white', padding: '1rem', borderRadius: 8, marginTop: 8 }}>
          hsl({hue} 70% 45%)
        </div>
      </Demo>
    </FeaturePage>
  )
}
